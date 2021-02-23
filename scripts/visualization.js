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
  var voiceRef = firebaseRef.child("voice");      // reference to voice tree in firebase realtime database

  // state variables (0 for none, 1 for mouse, 2 for gaze)
  window.sendDataState = 0;
  window.visualizationState = 0;

  //when this user closes their window, removes them from the database and removes their mouse
  window.addEventListener("beforeunload", function () {
    if (document.getElementById('voiceChatSwitch').checked) {
      onLeave();
      document.getElementById('voiceChatSwitch').checked = false;
    }
    mousePosRef.child(userId).set(null);
    gazePosRef.child(userId).set(null);
    voiceRef.child(userId).set(null);
    firebaseRef.child("users").child(userId).set(null);

    mousePosRef.child(userId).remove();
    gazePosRef.child(userId).remove();
    voiceRef.child(userId).remove();
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
      return "All Users";
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

  $("#visualize-checkboxes").multiselect({
    includeSelectAllOption: true,
    disableIfEmpty: true,
    //for UI button positioning purposes
    buttonContainer: $("#visualize-control-container"),
    buttonClass: "visualize-checkboxes",
    buttonText: function () {
      return "Visualize Data";
    },
    //updates local dictionaries if a checked value changes
    onChange: function (option, checked, select) {
      console.log('onChange');
    },
    //separate callback for select all
    onSelectAll: function () {
      console.log('onSelectAll');
    },
    //separate callback for deselect all
    onDeselectAll: function () {
      console.log('onDeselectAll');
    }
  });

  // FIREBASE TOGGLES HERE
  firepad.on("ready", function () {
    if (firepad.isHistoryEmpty()) {
      firepad.setText("Welcome to EyeWrite");
    }

    //we grab the codemirror instance from firepad now that firepad is ready
    FirepadCM = firepad.editorAdapter_.cm;

    cmScrollTop = FirepadCM.coordsChar({ left: 0, top: 0 }, "local");
    cmScrollBottom = FirepadCM.coordsChar({ left: 0, top: 600 }, "local"); //just an estimate for initial value

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
    // gazePosRef.on("value", visualize);

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

      if (window.sendDataState == 0 || window.sendDataState == 1) {
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

    var mouseSendSwitch = document.getElementById("mouseSendSwitch");
    var gazeSendSwitch = document.getElementById("gazeSendSwitch");

    var mouseVisSwitch = document.getElementById("mouseVisSwitch");
    var gazeVisSwitch = document.getElementById("gazeVisSwitch");

    var voiceChatSwitch = document.getElementById("voiceChatSwitch");
    var voiceMuteButton = document.getElementById("mute");

    //Controls toggling for mouse vs. gaze

    function getDataState(val) {
      if (val == 0) return 'none';
      else if (val == 1) return 'mouse';
      else if (val == 2) return 'gaze';
      else return 'invalid';
    }

    function clearHighlights() {
      for (const [_, singleUserHighlight] of Object.entries(userHighlights)) {
        singleUserHighlight.clear();
      }
    }

    mouseSendSwitch.addEventListener("change", function () {
      if (mouseSendSwitch.checked) {
        // gazeSendSwitch.checked = false;
        if (gazeSendSwitch.checked) {
          window.sendDataState = 3;
        } else {
          window.sendDataState = 1;
        }
      } else {
        if (gazeSendSwitch.checked) {
          window.sendDataState = 2;
        } else {
          window.sendDataState = 0;
          // clearHighlights();
        }
      }
      // console.log(`send data state: ${getDataState(window.sendDataState)}`);
    });

    gazeSendSwitch.addEventListener("change", function () {
      if (gazeSendSwitch.checked) {
        // mouseSendSwitch.checked = false;
        if (mouseSendSwitch.checked) {
          window.sendDataState = 3;
        } else {
          window.sendDataState = 2;
        }
      } else {
        if (mouseSendSwitch.checked) {
          window.sendDataState = 1;
        } else {
          window.sendDataState = 0;
          // clearHighlights();
        }
      }
      // console.log(`send data state: ${getDataState(window.sendDataState)}`);
    });

    mouseVisSwitch.addEventListener("change", function () {
      if (mouseVisSwitch.checked) {
        if (gazeVisSwitch.checked) {
          gazeVisSwitch.checked = false;
          gazePosRef.off("value", visualize);
        }
        if (window.visualizationState != 1) window.visualizationState = 1;
        mousePosRef.on("value", visualize);
      } else {
        if (!gazeVisSwitch.checked) {
          window.visualizationState = 0;
          mousePosRef.off("value", visualize);
          clearHighlights();
        }
      }
      console.log(`visualization state: ${getDataState(window.visualizationState)}`);
    });

    gazeVisSwitch.addEventListener("change", function () {
      if (gazeVisSwitch.checked) {
        if (mouseVisSwitch.checked) {
          mouseVisSwitch.checked = false;
          mousePosRef.off("value", visualize);
        }
        if (window.visualizationState != 2) window.visualizationState = 2;
        gazePosRef.on("value", visualize);
      } else {
        if (!mouseVisSwitch.checked) {
          window.visualizationState = 0;
          gazePosRef.off("value", visualize);
          clearHighlights();
        }
      }
      console.log(`visualization state: ${getDataState(window.visualizationState)}`);
    });

    voiceChatSwitch.addEventListener("change", function () {
      if (voiceChatSwitch.checked == true) {
        voiceChatSwitch.disabled = true;
        voiceRef.child(userId).update({ is_muted: false, is_ready: true, peer_id: -1, stream_id: -1 })
        onJoin();
      } else {
        voiceChatSwitch.disabled = true;
        onLeave();
      }
    });

    voiceMuteButton.onclick = toggleMuteButton;

  });

  //Callback for mouse movement
  function mouseMove(event) {
    //transforms mouse coordinates to codemirror document position
    if (window.sendDataState == 0 || window.sendDataState == 2) {
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
            // NOT WORKING CORRECTLY, RETURNS TOKEN OF THE ENTIRE PARAGRAPH.
            let visToken = FirepadCM.getTokenAt({ line: line, ch: ch });
            // getTokenAt returns the entire paragraph (line corresponds to paragraph, ch corresponds to exact character in paragraph)

            //transforms the word into multi-sentence range
            let sentences = wordToLines(visToken, line, ch);
            // console.log(line, ch);
            // console.log(visToken);
            // console.log(sentences);

            // default for if something goes wrong and sentences is null
            if (!sentences) {
              sentences.left = visToken.start;
              sentences.right = vistToken.end;
            }

            // let region = wordToLines(visToken, line, ch);

            var userColorDiv = document.getElementsByClassName("firepad-user-" + childSnapshot.key)[0].getElementsByClassName("firepad-userlist-color-indicator")[0];

            if (isAboveView(line, cmScrollTop, sentences)) {
              if (childSnapshot.key != userId) {
                createUpArrow(childSnapshot.key, userColorDiv, line, sentences);
              }
            } else if (isBelowView(line, cmScrollBottom, sentences)) {
              if (childSnapshot.key != userId) {
                createDownArrow(childSnapshot.key, userColorDiv, line, sentences);
              }
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
  // function wordToLines(token, line) {
  function wordToLines(token, line, ch) {

    //function for finding the token index in the array of tokens
    const isToken = (element) => element.start == token.start && element.end == token.end;

    //array of all tokens from the given line
    let lineTokens = FirepadCM.getLineTokens(line);

    //the index found using the function isToken which checks if each element is the given token
    let index = lineTokens.findIndex(isToken);

    var slider = document.getElementById("sentenceSlider");

    if (index != -1) {
      let numPad = Math.floor(slider.value / 2);
      if (slider.value % 2 == 0) {
        if (ch <= Math.floor((token.end - token.start) / 2)) {
          return { left: line - numPad, right: line + numPad };
        } else {
          return { left: line - numPad + 1, right: line + numPad + 1 };
        }
      } else {
        return { left: line - numPad, right: line + numPad + 1 };
      }

      //left and right bumpers for finding periods and determining the highlight range
      let leftBump = index;
      let rightBump = index;

      //counters for the number of periods allowed on the left of the word and on the right of the word
      let leftPeriodCount = slider.value;
      let rightPeriodCount = slider.value;
      // let leftPeriodCount = 2;
      // let rightPeriodCount = 2;

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

      console.log({
        index: index,
        token: token,
        line: line,
        ch: ch,
        slidervalue: slider.value,
        lineTokens: lineTokens,
      });


      if (lineTokens[leftBump]["start"] == 0) {
        return { left: lineTokens[leftBump]["start"], right: lineTokens[rightBump]["end"] };
      } else {
        return { left: lineTokens[leftBump]["start"] + 1, right: lineTokens[rightBump]["end"] };
      }
      // return { left: null, right: null };
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
      // { line: line, ch: sentences["left"] },
      // { line: line, ch: sentences["right"] },
      { line: sentences["left"], ch: 0 },
      { line: sentences["right"], ch: 0 },
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

  // PeerDemo Integration

  /**
   * Instance Variables
   */
  var myPeer;                 // the local client's peer
  var myStream;               // the local client's media stream
  var readyToJoin = false;    // whether the local client is ready to join
  var remoteClients = {};     // collection of remote clients, indexed by user id
  var audioElems = {};        // collection of live audio elements
  var config = {
    'iceServers': [
      { 'urls': 'stun:stun.services.mozilla.com' },
      { 'urls': 'stun:stun.l.google.com:19302' }
    ]
  };

  /**
   * Listener for new additions to voiceRef.
   */
  voiceRef.on("child_added", function (snapshot) {
    if (userId != snapshot.key) {                       // when the added child is not the local client
      remoteClients[snapshot.key] = snapshot.val();
    } else {                                            // when the added child is the local client
      if (snapshot.child("is_ready")) {
        readyToJoin = true;
      }
    }

    // // Display meeting members to client.
    // var memberTag = document.createElement("p");
    // memberTag.id = snapshot.key;
    // memberTag.innerText = snapshot.child("name").val();
    // document.getElementById("member-list").appendChild(memberTag);
  });

  /**
   * Listener for updates to voiceRef.
   */
  voiceRef.on("child_changed", function (snapshot) {
    if (userId != snapshot.key) {                                   // when the updated child is not the local client
      snapshot.forEach(function (child) {
        remoteClients[snapshot.key][child.key] = child.val();
      });
    } else {                                                        // when the updated child is the local client
      if (snapshot.child("is_ready")) {
        readyToJoin = true;
      }
    }

    if (myPeer && myPeer.id && readyToJoin) {
      for (uId in remoteClients) {
        if (uId < userId && remoteClients[uId]["is_ready"] && remoteClients[uId]["peer_id"] && remoteClients[uId]["peer_id"] != -1) callRemotePeer(uId);
      }
    }
  });

  /**
   * Listener for removals from voiceRef.
   */
  voiceRef.on("child_removed", function (snapshot) {
    if (remoteClients[snapshot.key]) {
      delete remoteClients[snapshot.key];
    }
    let streamId = snapshot.child("stream_id").val()
    if (audioElems[streamId]) removeAudioElement(streamId);
    // document.getElementById(snapshot.key).remove();
  });

  /**
   * Callback for the join button.
   */
  function onJoin() {
    startMyStream();
    // startMyStream();        // start my local stream
    // createMyPeer();         // create my peer
  }

  // /**
  //  * Creates a mute button.
  //  */
  // function createMuteButton() {
  //   btn = document.createElement("button");
  //   btn.className = "btn btn-primary";
  //   btn.id = "mute";
  //   btn.type = "button";
  //   btn.innerText = "mute";
  //   btn.onclick = toggleMuteButton;
  //   document.getElementById('buttons').appendChild(btn);
  // }

  /**
   * Toggles the mute button.
   */
  function toggleMuteButton() {
    let muteBtn = document.getElementById("mute");
    if (muteBtn.innerText == "Mute") {
      // alert('muting')
      voiceRef.child(userId).update({ is_muted: true });
      muteBtn.innerText = "Unmute";
      for (uId in remoteClients) {
        if (remoteClients[uId]["conn"]) remoteClients[uId]["conn"].send(`${userId} mute ${myStream.id}`);
      }
    } else if (muteBtn.innerText == "Unmute") {
      // alert('unmuting')
      voiceRef.child(userId).update({ is_muted: false });
      muteBtn.innerText = "Mute";
      for (uId in remoteClients) {
        if (remoteClients[uId]["conn"]) remoteClients[uId]["conn"].send(`${userId} unmute ${myStream.id}`);
      }
    } else {
      console.log("Error");
    }
  }

  /**
   * Starts local stream, creates local client's peer, and creates a mute button.
   */
  function startMyStream() {
    navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(function (stream) {
      myStream = stream;
      console.log(`${userId} turned on audio stream: ${myStream.id}`);
      voiceRef.child(userId).update({ is_ready: true, stream_id: myStream.id });
      hasStream = true;
      createMyPeer();
      console.log(`${userId} joined the chat`);
      alert("Joining the voice chat.");
      document.getElementById("voiceChatSwitch").disabled = false;
      document.getElementById("mute").disabled = false;
      // createMuteButton();
    }).catch(function (err) {
      console.error(`${userId} failed to turn on audio stream`, err);
      voiceChatSwitch = document.getElementById("voiceChatSwitch");
      voiceChatSwitch.checked = false;
      voiceChatSwitch.disabled = false;
    });
  }

  /**
   * Ends local stream.
   */
  function endMyStream() {
    myStream.getTracks().forEach(function (track) {
      track.stop();
    });
    myStream = null;
  }

  /**
   * Adds a stream to #audio-streams
   * https://github.com/Bohmaster/real-time-audio-chat
   * 
   * @param {mediaStream} stream 
   */
  function addAudioElement(stream) {
    if (!audioElems[stream.id]) {
      var audio = document.createElement("audio");
      audio.autoplay = true;
      audio.load();
      audio.addEventListener("load", function () {
        audio.play();
      }, true);
      audio.id = stream.id;
      audio.srcObject = stream;
      audioElems[audio.id] = audio;
      document.querySelector("#audio-streams").append(audio);
      console.log(`added ${stream.id} to #audio-streams`);
    }
  }

  /**
   * Toggles the audio element with the given streamId.
   * 
   * @param {String} streamId 
   */
  function toggleAudioElement(streamId) {
    console.log(streamId);
    let stream = audioElems[streamId].srcObject;
    stream.getAudioTracks().forEach(function (track) {
      track.enabled = !track.enabled;
    });
  }

  /**
   * Removes the audio element with the given streamId.
   * 
   * @param {String} streamId 
   */
  function removeAudioElement(streamId) {
    let audio = audioElems[streamId];
    if (audio != -1) {
      audio.srcObject.getTracks().forEach(function (track) {
        track.stop();
      });
      audio.remove();
      delete audioElems[streamId];
      console.log(`removed ${streamId} from audio`);
    }
  }

  /**
   * Creates the local client's peer.
   */
  function createMyPeer() {

    myPeer = new Peer({ config: config, debug: 1 });

    // call backs for opening connection and error
    myPeer.on('open', function (id) {
      voiceRef.child(userId).update({ peer_id: id, is_ready: readyToJoin });
      if (readyToJoin) voiceRef.child(userId).update({ stream_id: myStream.id });
    });

    myPeer.on('error', function (error) {
      console.error(error);
    });

    // handling incoming data connection
    myPeer.on('connection', function (conn) {
      conn.on('data', function (data) {
        var tmp = data.split(" ");
        console.log(`${tmp[0]} -> ${userId}: ${tmp.slice(1).join(" ")}`);
        switch (tmp[1]) {
          case "new-connection":
            remoteClients[tmp[0]]["conn"] = conn;
            break;
          case "mute":
            toggleAudioElement(tmp[2]);
            document.getElementById(tmp[0]).innerText = `${remoteClients[tmp[0]]["name"]} (muted)`;
            console.log(`muted ${tmp[0]}`);
            break;
          case "unmute":
            toggleAudioElement(tmp[2]);
            document.getElementById(tmp[0]).innerText = `${remoteClients[tmp[0]]["name"]}`;
            console.log(`unmuted ${tmp[0]}`);
            break;
        }
      });
      conn.on('open', function () {
        conn.send(`${userId} new-connection`);
        // console.log(`sent: new-connection from ${userId}`);
      });
    });

    // handling incoming audio connection
    myPeer.on('call', function (call) {
      // Answer the call
      call.answer(myStream);
      call.on('stream', function (stream) {
        addAudioElement(stream);
      });
      console.log(`${userId} answered a call`);
    });
  }

  /**
   * Calls a remote client given the remote client's peer id.
   * 
   * @param {String} id 
   */
  function callRemotePeer(id) {
    if (!remoteClients[id]["conn"]) {
      remoteClients[id]["conn"] = true;

      console.log(`${userId} started a call`);
      let peerId = remoteClients[id]["peer_id"];
      let conn = myPeer.connect(peerId);

      conn.on('data', function (data) {
        var tmp = data.split(" ");
        console.log(`${tmp[0]} -> ${userId}: ${tmp.slice(1).join(" ")}`);
        switch (tmp[1]) {
          case "new-connection":
            remoteClients[tmp[0]]["conn"] = conn;
            break;
          case "mute":
            toggleAudioElement(tmp[2]);
            document.getElementById(tmp[0]).innerText = `${remoteClients[tmp[0]]["name"]} (muted)`;
            console.log(`muted ${tmp[0]}`);
            break;
          case "unmute":
            toggleAudioElement(tmp[2]);
            document.getElementById(tmp[0]).innerText = `${remoteClients[tmp[0]]["name"]}`;
            console.log(`unmuted ${tmp[0]}`);
            break;
        }
      });

      conn.on('open', function () {
        conn.send(`${userId} new-connection`);
        // console.log(`sent: new-connection from ${userId}`);
      });

      let call = myPeer.call(peerId, myStream);
      call.on('stream', addAudioElement);
    }
  }

  /**
   * Callback for when the user clicks the leave button.
   */
  function onLeave() {
    console.log(`${userId} left the chat`);
    (async function () { return await myPeer.destroy(); })();
    myPeer = null;
    readyToJoin = false;
    endMyStream();
    for (uId in remoteClients) {
      removeAudioElement(remoteClients[uId]["stream_id"]);
    }
    voiceRef.child(userId).set(null);
    alert("Leaving the voice chat.");
    document.getElementById("mute").disabled = true;
    document.getElementById("mute").innerText = "Mute";
    document.getElementById("voiceChatSwitch").disabled = false;
  }


  // /**
  //  * Listens for when the user exits the tab or window.
  //  */
  // window.addEventListener("beforeunload", function () {
  //   if (document.getElementById('join').disabled) onLeave();
  //   voiceRef.child(userId).set(null);
  // });
}();

