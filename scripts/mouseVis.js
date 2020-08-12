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

  //initializes bootstrap-multiselect checkboxes
  $("#user-checkboxes").multiselect({
    includeSelectAllOption: true,
    disableIfEmpty: true,
    //for UI button positioning purposes
    buttonContainer: $("#user-checkboxes-container"),
    buttonClass: "user-checkboxes",
    buttonText: function () {
      return "Collaborators";
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

  firepad.on("ready", function () {
    if (firepad.isHistoryEmpty()) {
      firepad.setText("Welcome to EyeWrite");
    }

    //we grab the codemirror instance from firepad now that firepad is ready
    FirepadCM = firepad.editorAdapter_.cm;

    cmScrollTop = FirepadCM.coordsChar({ left: 0, top: 0 }, "local");
    cmScrollBottom = FirepadCM.coordsChar({ left: 0, top: 500 }, "local"); //just an estimate for initial value

    FirepadCM.on("scroll", function () {
      cmScrollTop = FirepadCM.coordsChar({ left: 0, top: FirepadCM.getScrollInfo().top }, "local");
      cmScrollBottom = FirepadCM.coordsChar({ left: 0, top: FirepadCM.getScrollInfo().top + FirepadCM.getScrollInfo().clientHeight }, "local");
    });

    //Firebase listener for when users are added
    firebaseRef.child("users").on("child_added", function (snapshot) {

      userColors[snapshot.key] = snapshot.child("color").val();

      //place holder to display userId when the name is not ready
      $("#user-checkboxes").append("<option value=" + snapshot.key + ">" + snapshot.key + "</option>");
      $("#user-checkboxes").multiselect("rebuild");
      if (snapshot.key != userId) {
        $("#user-checkboxes").multiselect("select", snapshot.key);
        usersChecked[snapshot.key] = true;
      } else {
        usersChecked[snapshot.key] = false;
      }

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
    gazePosRef.on("value", visualize);

    /*
      NOTICE!
      If you want to use an external eyetracker, you can plug in your
      stream of (x,y) coordinates here. Use the two lines within
      setGazeListener to transform (x,y) coordinates to Code Mirror
      position, then send to Firebase. Make sure your (x,y)
      coordinates are relative to the browser window top left corner.
    */

    //needed in order to load calibration data
    window.saveDataAcrossSessions = true;
    //applying smoothing filter
    window.applyKalmanFilter = true;

    //Listens for WebGazer gaze predictions, sends to firebase
    webgazer.setGazeListener(function (data, elapsedTime) {
      if (data == null) {
        return;
      }

      if (window.blocked) {
        gazePosRef.child(userId).update({ line: -1, ch: -1 });
      } else {
        var gazePosition = FirepadCM.coordsChar({ left: data.x, top: data.y }, "window");
        gazePosRef.child(userId).update({ line: gazePosition.line, ch: gazePosition.ch });
      }
    }).begin();

    //WebGazer specifications
    webgazer.showVideo(false);
    webgazer.showFaceOverlay(false);
    webgazer.showFaceFeedbackBox(false);
    webgazer.showPredictionPoints(false);

    //Mouse Listeners
    var target = document.getElementById("firepad");
    target.addEventListener("mousemove", mouseMove);
    target.addEventListener("mouseleave", mouseLeave);

    //Fetches the buttons responsible for toggling mouse vs. gaze and send vs. block
    var mouseButton = document.getElementById("mouseButton");
    var gazeButton = document.getElementById("gazeButton");
    var sendButton = document.getElementById("sendButton");
    var blockButton = document.getElementById("blockButton");

    //Controls toggling for mouse vs. gaze
    mouseButton.addEventListener("change", function () {
      if (mouseButton.checked) {
        gazePosRef.off("value", visualize);

        mousePosRef.on("value", visualize);
      }
    });
    gazeButton.addEventListener("change", function () {
      if (gazeButton.checked) {
        mousePosRef.off("value", visualize);

        gazePosRef.on("value", visualize);
      }
    });

    //Controls toggling for send vs. block
    sendButton.addEventListener("change", function () {
      if (sendButton.checked) {
        window.blocked = false;
      }
    });
    blockButton.addEventListener("change", function () {
      if (blockButton.checked) {
        window.blocked = true;
      }
    });

    //to correctly assign button width dynamically
    //document.getElementById("user-checkboxes-container").getElementsByTagName("button")[0].style.width = (UIAdjustments.userlistBoxOffsetWidth - 20) + "px";
  });

  //Callback for mouse movement
  function mouseMove(event) {
    //transforms mouse coordinates to codemirror document position
    if (window.blocked) {
      mousePosRef.child(userId).update({ line: -1, ch: -1 }); //to signal in the database that this user's data is being blocked
    } else {
      var mouse = FirepadCM.coordsChar({ left: event.clientX, top: event.clientY }, "window"); //else send as a CodeMirror line and ch
      mousePosRef.child(userId).update({ line: mouse.line, ch: mouse.ch });
    }
  }

  //Callback for when the mouse leaves the target
  function mouseLeave() {
    //send nulls to firebase to signal the user is off target but has not closed the window
    mousePosRef.child(userId).update({ line: null, ch: null });
  }

  //callback function for visualization
  function visualize(snapshot) {
    snapshot.forEach(function (childSnapshot) {

      if (usersChecked[childSnapshot.key]) {
        //grabs position info
        let line = childSnapshot.child("line").val();
        let ch = childSnapshot.child("ch").val();

        //if there already exists a highlight for this user we clear it to make a new one
        if (userHighlights[childSnapshot.key]) {
          userHighlights[childSnapshot.key].clear();
        }

        //incase we get passed nulls
        if (line != null && ch != null) {

          if (line == -1 || ch == -1) {
            if (userHighlights[childSnapshot.key]) {
              userHighlights[childSnapshot.key].clear();
            }

          } else {

            //finds the word (token) in the codemirror editor nearest to the position given
            let visToken = FirepadCM.getTokenAt({ line: line, ch: ch });

            //transforms the word into multi-sentence range
            let sentences = wordToLine(visToken, line);

            //default for if something goes wrong and sentences is null
            if (!sentences) {
              sentences.left = visToken.start;
              sentences.right = vistToken.end;
            }

            var userColorDiv = document.getElementsByClassName("firepad-user-" + childSnapshot.key)[0].getElementsByClassName("firepad-userlist-color-indicator")[0];

            if (isAboveView(line, cmScrollTop, sentences)) {
              createUpArrow(childSnapshot.key, userColorDiv, line, sentences);
            } else if (isBelowView(line, cmScrollBottom, sentences)) {
              createDownArrow(childSnapshot.key, userColorDiv, line, sentences);
            } else {
              createHighlight(childSnapshot.key, userColorDiv, line, sentences);
            }
          }

        } else {
          userHighlights[childSnapshot.key].clear();
          var userColorDiv = document.getElementsByClassName("firepad-user-" + childSnapshot.key)[0].getElementsByClassName("firepad-userlist-color-indicator")[0];
          clearArrow(userColorDiv);
        }
      }
    });
  }

  //Transforms a string hex color to a string rgb color with a fixed opacity
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

  //Checks if a highlight is above the client view port
  function isAboveView(line, viewTop, sentences) {
    return line < viewTop["line"] || (line == viewTop["line"] && sentences["right"] < viewTop["ch"]);
  }

  //Checks if a highlight is bellow the client view port
  function isBelowView(line, viewBottom, sentences) {
    return line > viewBottom["line"] || (line == viewBottom["line"] && sentences["left"] > viewBottom["ch"]);
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

  //Creates up arrow indicating a user's highlight is above the view port
  function createUpArrow(userId, userColorDiv, line, sentences) {
    if (!userColorDiv.hasChildNodes()) {
      var arrow = document.createElement("div");

      //constructing arrow shape
      var arrowTip = document.createElement("div");
      arrowTip.className = "arrow-up";
      arrow.appendChild(arrowTip);

      var arrowStem = document.createElement("div");
      arrowStem.className = "arrow-stem";
      arrow.appendChild(arrowStem);

      //Click for "jump-to" functionality
      arrow.onclick = function () {
        FirepadCM.on("refresh", function mark() {
          FirepadCM.off("refresh", mark);
          createHighlight(userId, userColorDiv, line, sentences);
        });
        FirepadCM.scrollIntoView({ line: line, ch: sentences["left"] });
        FirepadCM.refresh();
      }
      userColorDiv.appendChild(arrow);
    } else if (userColorDiv.firstChild.firstChild.className == "arrow-stem") { //if there's already a down arrow
      clearArrow(userColorDiv);
      createUpArrow(userId, userColorDiv, line, sentences);
    } else {
      userColorDiv.firstChild.onclick = function () { //if there's already an up arrow, update the position to jump to
        FirepadCM.on("refresh", function mark() {
          FirepadCM.off("refresh", mark);
          createHighlight(userId, userColorDiv, line, sentences);
        });
        FirepadCM.scrollIntoView({ line: line, ch: sentences["left"] });
        FirepadCM.refresh();
      }
    }
  }

  //Creates down arrow indicating a user's highlight is bellow the view port
  function createDownArrow(userId, userColorDiv, line, sentences) {
    if (!userColorDiv.hasChildNodes()) {
      var arrow = document.createElement("div");

      //constructing arrow shape
      var arrowStem = document.createElement("div");
      arrowStem.className = "arrow-stem";
      arrow.appendChild(arrowStem);

      var arrowTip = document.createElement("div");
      arrowTip.className = "arrow-down";
      arrow.appendChild(arrowTip);

      //Click for "jump-to" functionality
      arrow.onclick = function () {
        FirepadCM.on("refresh", function mark() {
          FirepadCM.off("refresh", mark);
          createHighlight(userId, userColorDiv, line, sentences);
        });
        FirepadCM.scrollIntoView({ line: line, ch: sentences["right"] });
        FirepadCM.refresh();
      }
      userColorDiv.appendChild(arrow);

    } else if (userColorDiv.firstChild.firstChild.className == "arrow-up") { //if there's already an up arrow
      clearArrow(userColorDiv);
      createDownArrow(userId, userColorDiv, line, sentences);
    } else {
      userColorDiv.firstChild.onclick = function () { //if there's already a down arrow
        FirepadCM.on("refresh", function mark() {
          FirepadCM.off("refresh", mark);
          createHighlight(userId, userColorDiv, line, sentences);
        });
        FirepadCM.scrollIntoView({ line: line, ch: sentences["right"] });
        FirepadCM.refresh();
      }
    }
  }

  //Clears the color indicator of any arrow
  function clearArrow(userColorDiv) {
    if (userColorDiv.hasChildNodes()) {
      while (userColorDiv.firstChild) {
        userColorDiv.removeChild(userColorDiv.firstChild);
      }
    }
  }
}();

