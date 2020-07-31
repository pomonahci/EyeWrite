var mouseVis = function () {
  //reference for our firepad's instance of codemirror
  var FirepadCM;
  //dictionary for user colors
  var userColors = {};
  //dictionary for user highlights
  var userHighlights = {};
  //dictionary for visualization checkboxes
  var usersChecked = {};

  //keeps track of CM viewport
  var cmScrollTop;
  var cmScrollBottom;

  //reference to firebase user mouse and gaze positions
  var mousePosRef = firebaseRef.child("mice");
  var gazePosRef = firebaseRef.child("gaze");

  //when this user closes their window, removes them from the database and removes their mouse
  window.addEventListener("beforeunload", function () {
    mousePosRef.child(userId).remove();
    gazePosRef.child(userId).remove();
    firebaseRef.child("users").child(userId).remove();
  });

  firepad.on("ready", function () {
    if (firepad.isHistoryEmpty()) {
      firepad.setText("Welcome to EyeWrite");
    }

    //initializes bootstrap-multiselect checkboxes
    $("#user-checkboxes").multiselect({
      includeSelectAllOption: true,
      disableIfEmpty: true,
      //for UI button positioning purposes
      buttonContainer: $("#user-checkboxes-container"),
      buttonText: function () {
        return "Visualize Users";
      },
      //updates local dictionaries if a checked value changes
      onChange: function (option, checked, select) {
        usersChecked[option.val()] = checked;
        if (userHighlights[option.val()]) {
          userHighlights[option.val()].clear();
        }
      },
      //separate callback for select all
      onSelectAll: function () {
        for (key in usersChecked) {
          usersChecked[key] = true;
          if (userHighlights[key]) {
            userHighlights[key].clear();
          }
        }
      },
      //separate callback for deselect all
      onDeselectAll: function () {
        for (key in usersChecked) {
          usersChecked[key] = false;
          if (userHighlights[key]) {
            userHighlights[key].clear();
          }
        }
      }
    });

    //to correctly assign button width dynamically
    document.getElementById("user-checkboxes-container").getElementsByTagName("button")[0].style.width = (UIAdjustments.userlistBox.offsetWidth - 20) + "px";

    //we grab the codemirror instance from firepad now that firepad is ready
    FirepadCM = firepad.editorAdapter_.cm;

    cmScrollTop = FirepadCM.coordsChar({ left: 0, top: FirepadCM.getScrollInfo().top }, "local");
    cmScrollBottom = FirepadCM.coordsChar({ left: 0, top: FirepadCM.getScrollInfo().top + FirepadCM.getScrollInfo().clientHeight }, "local");

    FirepadCM.on("scroll", function () {
      cmScrollTop = FirepadCM.coordsChar({ left: 0, top: FirepadCM.getScrollInfo().top }, "local");
      cmScrollBottom = FirepadCM.coordsChar({ left: 0, top: FirepadCM.getScrollInfo().top + FirepadCM.getScrollInfo().clientHeight }, "local");
    });

    //Firebase listener for when users are added
    firebaseRef.child("users").on("child_added", function (snapshot) {
      //don't add this client to local dictionary because we don't visualize ourselves
      // if (snapshot.key != userId) {

      usersChecked[snapshot.key] = true;
      userColors[snapshot.key] = snapshot.child("color").val();

      //if the name attribute in firebase hasn't already loaded (it takes a sec)
      if (snapshot.child("name").val() != null) {
        $("#user-checkboxes").append("<option value=" + snapshot.key + ">" + snapshot.child("name").val() + "</option>");
        $("#user-checkboxes").multiselect("rebuild");
        $("#user-checkboxes").multiselect("select", snapshot.key);

      } else {
        //place holder to display userId when the name is not ready
        $("#user-checkboxes").append("<option value=" + snapshot.key + ">" + snapshot.key + "</option>");
        $("#user-checkboxes").multiselect("rebuild");
        $("#user-checkboxes").multiselect("select", snapshot.key);

        //listen for when the name attribute is ready
        firebaseRef.child("users").child(snapshot.key).on("value", function (snapshot) {
          if (snapshot.child("name").val()) {
            //update the place holder entry
            $("option[value=" + snapshot.key + "]", $("#user-checkboxes"))[0].label = snapshot.child("name").val();
            $("#user-checkboxes").multiselect("rebuild");

            //remove the listener
            firebaseRef.child("users").child(snapshot.key).off("value");
          }
        });
      }
      // }
    });

    //Firebase listener for when usernames are changed
    firebaseRef.child("users").on("child_changed", function (snapshot) {
      if (snapshot.key != userId) {
        var userDiv = document.getElementsByClassName("firepad-user-" + snapshot.key)[0];

        if (snapshot.child("name").val()) {
          //update username in checkbox list
          $("option[value=" + snapshot.key + "]", $("#user-checkboxes"))[0].label = snapshot.child("name").val();
          $("#user-checkboxes").multiselect("rebuild");
          //update username in firepad userlist
          var userNameDiv = userDiv.getElementsByClassName("firepad-userlist-name")[0];
          userNameDiv.innerText = snapshot.child("name").val();
        }

        if (userColors[snapshot.key] && userColors[snapshot.key] != snapshot.child("color").val()) {
          userColors[snapshot.key] = snapshot.child("color").val();
          //update color in firepad userlist
          var userColorDiv = userDiv.getElementsByClassName("firepad-userlist-color-indicator")[0];
          userColorDiv.style.backgroundColor = snapshot.child("color").val();
        }
      } else {

        if (userColors[snapshot.key] && userColors[snapshot.key] != snapshot.child("color").val()) {
          userColors[snapshot.key] = snapshot.child("color").val();
        }
        if (snapshot.child("name").val()) {
          //update username in checkbox list
          $("option[value=" + snapshot.key + "]", $("#user-checkboxes"))[0].label = snapshot.child("name").val();
          $("#user-checkboxes").multiselect("rebuild");
        }

      }

    });

    //Firebase listener for when users are removed
    firebaseRef.child("users").on("child_removed", function (snapshot) {
      //remove their color from the local dict
      if (userColors[snapshot.key]) {
        delete userColors[snapshot.key];
      }
      //remove them from local usersChecked dict
      if (usersChecked[snapshot.key]) {
        delete usersChecked[snapshot.key];
      }
      //clear their highlight from the local dict and remove it
      if (userHighlights[snapshot.key]) {
        userHighlights[snapshot.key].clear();
        delete userHighlights[snapshot.key];
      }
      //remove them from the local checkbox list
      $("option[value=" + snapshot.key + "]", $("#user-checkboxes")).remove();
      $("#user-checkboxes").multiselect("rebuild");
    });

    //Firebase listener for mouse values, this callback is responsible for visualizing all users
    gazePosRef.on("child_changed", visualize);

    webgazer.setGazeListener(function (data, elapsedTime) {
      if (data == null) {
        return;
      }

      var gaze = FirepadCM.coordsChar({ left: data.x, top: data.y }, "window");
      gazePosRef.child(userId).update({ line: gaze.line, ch: gaze.ch });

    }).begin();

    webgazer.showVideo(false);
    webgazer.showFaceOverlay(false);
    webgazer.showFaceFeedbackBox(false);
    webgazer.showPredictionPoints(false);


    //taret element to track mouse movements
    var textEl = document.getElementById("firepad");

    //Mouse Event Listeners
    textEl.addEventListener("mousemove", mouseMove);

    textEl.addEventListener("mouseleave", mouseLeave);

    var transmitRadioInput = document.getElementById("transmit");
    var noTransmitRadioInput = document.getElementById("noTransmit");

    var mouseRadioInput = document.getElementById("mouseRadio");
    var gazeRadioInput = document.getElementById("gazeRadio");


    mouseRadioInput.addEventListener("change", function () {
      if (mouseRadioInput.checked) {
        gazePosRef.off("child_changed", visualize);

        mousePosRef.on("child_changed", visualize);
      }
    });

    gazeRadioInput.addEventListener("change", function () {
      if (gazeRadioInput.checked) {
        mousePosRef.off("child_changed", visualize);

        gazePosRef.on("child_changed", visualize);
      }
    });



    transmitRadioInput.addEventListener("change", function () {
      if (transmitRadioInput.checked) {
        textEl.addEventListener("mousemove", mouseMove);
        textEl.addEventListener("mouseleave", mouseLeave);
        webgazer.resume();

      }
    });

    noTransmitRadioInput.addEventListener("change", function () {
      if (noTransmitRadioInput.checked) {
        textEl.removeEventListener("mousemove", mouseMove);
        textEl.removeEventListener("mouseleave", mouseLeave);
        webgazer.pause();
        mousePosRef.child(userId).update(null);
        gazePosRef.child(userId).update(null);
      }
    });



    UIAdjustments.pickr.on("save", (color) => {
      if (color) {
        firepad.firebaseAdapter_.setColor(color.toHEXA().toString());
      }

      UIAdjustments.pickr.hide();
    });
  });

  function mouseMove(event) {
    //transforms mouse coordinates to codemirror document position
    var mouse = FirepadCM.coordsChar({ left: event.clientX, top: event.clientY }, "window");
    mousePosRef.child(userId).update({ line: mouse.line, ch: mouse.ch });
  }

  function mouseLeave() {
    //send nulls to firebase to signal the user is off target but has not closed the window
    mousePosRef.child(userId).update({ line: null, ch: null });
  }

  //callback function for visualization
  function visualize(childSnapshot) {
    let userId = childSnapshot.key;

    if (usersChecked[userId]) {
      //grabs position info
      let line = childSnapshot.child("line").val();
      let ch = childSnapshot.child("ch").val();

      //if there already exists a highlight for this user we clear it to make a new one
      if (userHighlights[userId]) {
        userHighlights[userId].clear();
      }

      //incase we get passed nulls
      if (line != null && ch != null) {
        //finds the word (token) in the codemirror editor nearest to the position given
        let visToken = FirepadCM.getTokenAt({ line: line, ch: ch });

        //transforms the word into multi-sentence range
        let sentences = wordToLine(visToken, line);

        //default for if something goes wrong and sentences is null
        if (!sentences) {
          sentences.left = visToken.start;
          sentences.right = vistToken.end;
        }

        var userColorDiv = document.getElementsByClassName("firepad-user-" + userId)[0].getElementsByClassName("firepad-userlist-color-indicator")[0];

        if (isAboveView(line, cmScrollTop, sentences)) {
          createUpArrow(userId, userColorDiv, line, sentences);
        } else if (isBelowView(line, cmScrollBottom, sentences)) {
          createDownArrow(userId, userColorDiv, line, sentences);
        } else {
          createHighlight(userId, userColorDiv, line, sentences);
        }
      } else {
        var userColorDiv = document.getElementsByClassName("firepad-user-" + userId)[0].getElementsByClassName("firepad-userlist-color-indicator")[0];
        clearArrow(userColorDiv);
      }
    }
  }

  function hexToRgb(hex) {
    let opacity = 0.35;
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? "rgb(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + "," + opacity + ")" : null;
  }

  //takes a word (token) and a line and highlights the sentence that word
  //is in, as well as the sentence before and the sentence after
  function wordToLine(token, line) {

    //function for finding the token index in the array of tokens
    const isToken = (element) => element.start == token.start && element.end == token.end;

    //array of all tokens from the given line
    let lineTokens = FirepadCM.getLineTokens(line);

    //the index found using the function isToken which checks if each element is the given token
    let index = lineTokens.findIndex(isToken);

    var slider = document.getElementById("sentenceSlider");

    if (index != -1) {

      //left and right bumpers for finding periods and determining the highlight range
      let leftBump = index;
      let rightBump = index;

      //counters for the number of periods allowed on the left of the word and on the right of the word
      let leftPeriodCount = slider.value;
      let rightPeriodCount = slider.value;

      //loop until period conditions are satisfied
      while (true) {
        //ticks left
        if (lineTokens[leftBump].start > 0 && leftPeriodCount > 0) {
          leftBump--;
        }
        //ticks right
        if (lineTokens[rightBump].end < lineTokens[lineTokens.length - 1].end && rightPeriodCount > 0) {
          rightBump++;
        }
        //counts down periods on the left
        if (lineTokens[leftBump]["string"].includes(".")) {
          leftPeriodCount--;
        }
        //counts down periods on the right
        if (lineTokens[rightBump]["string"].includes(".")) {
          rightPeriodCount--;
        }
        //if the period conditions are satisfied or we"re up against the begining of the line or the end of the line then break
        if ((leftPeriodCount <= 0 || lineTokens[leftBump]["start"] == 0) && (rightPeriodCount <= 0 || lineTokens[rightBump]["end"] == lineTokens[lineTokens.length - 1]["end"])) {
          break;
        }
      }
      //Just because the highlighting of the starting period on the left is annoying, but if
      //we"re at the begining of the line, the first character shouldn"t be left out of the highlight
      if (lineTokens[leftBump]["start"] == 0) {
        return { left: lineTokens[leftBump]["start"], right: lineTokens[rightBump]["end"] };
      } else {
        return { left: lineTokens[leftBump]["start"] + 1, right: lineTokens[rightBump]["end"] };
      }
    } else {
      return { left: null, right: null };
    }
  }

  function isAboveView(line, viewTop, sentences) {
    return line < viewTop["line"] || (line == viewTop["line"] && sentences["right"] < viewTop["ch"]);
  }

  function isBelowView(line, viewBottom, sentences) {
    return line > viewBottom["line"] || (line == viewBottom["line"] && sentences["left"] > viewBottom["ch"]);
  }

  function createUpArrow(userId, userColorDiv, line, sentences) {
    if (!userColorDiv.hasChildNodes()) {
      var arrow = document.createElement("div");

      var arrowTip = document.createElement("div");
      arrowTip.className = "arrow-up";
      arrow.appendChild(arrowTip);

      var arrowStem = document.createElement("div");
      arrowStem.className = "arrow-stem";
      arrow.appendChild(arrowStem);

      arrow.onclick = function () {
        FirepadCM.on("refresh", function mark() {
          FirepadCM.off("refresh", mark);
          createHighlight(userId, userColorDiv, line, sentences);
        });
        FirepadCM.scrollIntoView({ line: line, ch: sentences["left"] });
        FirepadCM.refresh();
      }
      userColorDiv.appendChild(arrow);
    } else if (userColorDiv.firstChild.firstChild.className == "arrow-stem") {
      clearArrow(userColorDiv);
      createUpArrow(userId, userColorDiv, line, sentences);
    } else {
      userColorDiv.firstChild.onclick = function () {
        FirepadCM.on("refresh", function mark() {
          FirepadCM.off("refresh", mark);
          createHighlight(userId, userColorDiv, line, sentences);
        });
        FirepadCM.scrollIntoView({ line: line, ch: sentences["left"] });
        FirepadCM.refresh();
      }
    }
  }

  function createDownArrow(userId, userColorDiv, line, sentences) {
    if (!userColorDiv.hasChildNodes()) {
      var arrow = document.createElement("div");

      var arrowStem = document.createElement("div");
      arrowStem.className = "arrow-stem";
      arrow.appendChild(arrowStem);

      var arrowTip = document.createElement("div");
      arrowTip.className = "arrow-down";
      arrow.appendChild(arrowTip);

      arrow.onclick = function () {
        FirepadCM.on("refresh", function mark() {
          FirepadCM.off("refresh", mark);
          createHighlight(userId, userColorDiv, line, sentences);
        });
        FirepadCM.scrollIntoView({ line: line, ch: sentences["right"] });
        FirepadCM.refresh();
      }
      userColorDiv.appendChild(arrow);

    } else if (userColorDiv.firstChild.firstChild.className == "arrow-up") {
      clearArrow(userColorDiv);
      createDownArrow(userId, userColorDiv, line, sentences);
    } else {
      userColorDiv.firstChild.onclick = function () {
        FirepadCM.on("refresh", function mark() {
          FirepadCM.off("refresh", mark);
          createHighlight(userId, userColorDiv, line, sentences);
        });
        FirepadCM.scrollIntoView({ line: line, ch: sentences["right"] });
        FirepadCM.refresh();
      }
    }
  }

  function clearArrow(userColorDiv) {
    if (userColorDiv.hasChildNodes()) {
      while (userColorDiv.firstChild) {
        userColorDiv.removeChild(userColorDiv.firstChild);
      }
    }
  }

  function createHighlight(userId, userColorDiv, line, sentences) {
    clearArrow(userColorDiv);

    //creates a highlight (TextMarker object) for the multi-sentence highlight range and uses the user"s color
    let highlight = FirepadCM.markText(
      { line: line, ch: sentences["left"] },
      { line: line, ch: sentences["right"] },
      { css: "background: " + hexToRgb(userColors[userId]) });

    //associates this highlight with the user it came from in our local dictionary to keep track
    userHighlights[userId] = highlight;
  }
}();

