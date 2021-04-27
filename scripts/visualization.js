var mouseVis = function () {

  var FirepadCM;            // reference for our firepad's codemirror instance
  var userColors = {};      // object for user colors
  var userHighlights = {};  // dictionary for user highlights
  var userLocations = {};   // dictionary for user locations
  var usersChecked = {};    // dictionary for visualization checkboxes
  var userArrows = {};

  //reference to firebase user mouse and gaze positions
  var mousePosRef = firebaseRef.child("mice");
  var gazePosRef = firebaseRef.child("gaze");
  var voiceRef = firebaseRef.child("voice");      // reference to voice tree in firebase realtime database

  // state variables (0 for none, 1 for mouse, 2 for gaze)
  window.sendDataState = 0;
  window.visualizationState = 0;

  var visShapeSelector = document.querySelector("#vis-shape");
  window.visShape = visShapeSelector.value;

  visShapeSelector.onchange = function () {
    window.visShape = visShapeSelector.value;
    // console.log(window.visShape);
  };

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
      // if (userHighlights[option.val()]) {
      //   userHighlights[option.val()].clear();
      // }
    },
    //separate callback for select all
    onSelectAll: function () {
      for (key in usersChecked) {
        usersChecked[key] = true;
        // if (userHighlights[key]) {
        //   userHighlights[key].clear();
        // }
      }
    },
    //separate callback for deselect all
    onDeselectAll: function () {
      for (key in usersChecked) {
        usersChecked[key] = false;
        // if (userHighlights[key]) {
        //   userHighlights[key].clear();
        // }
      }
    }
  });

  // FIREBASE TOGGLES HERE
  firepad.on("ready", function () {

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
        gazePosRef.child(userId).update({ region: null, relX: null, relY: null });
      } else {
        var encodedLoc = encodeLocation(data.x, data.y);
        gazePosRef.child(userId).update(encodedLoc);
      }
    }).begin();

    //WebGazer specifications
    webgazer.showVideo(false);
    webgazer.showFaceOverlay(false);
    webgazer.showFaceFeedbackBox(false);
    webgazer.showPredictionPoints(false);

    //Mouse Listeners
    // var target = document.getElementById("firepad");
    document.addEventListener("mousemove", mouseMove);
    // document.addEventListener("mousedown", mouseMove);
    // document.addEventListener("oncl")
    document.addEventListener("mouseleave", mouseLeave);

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

    // function clearHighlights() {
    //   for (const [_, singleUserHighlight] of Object.entries(userHighlights)) {
    //     singleUserHighlight.clear();
    //   }
    // }

    function startVisualization(dataType) {
      if (dataType == "gaze") {
        gazePosRef.on("child_added", visualize);
        gazePosRef.on("child_changed", visualize);
        gazePosRef.on("child_removed", removeHighlight2);
      } else if (dataType == "mouse") {
        mousePosRef.on("child_added", visualize);
        mousePosRef.on("child_changed", visualize);
        mousePosRef.on("child_removed", removeHighlight2);
      } else {
        console.log("Invalid data type!");
      }
    }

    function stopVisualization(dataType) {
      if (dataType == "gaze") {
        gazePosRef.off("child_added", visualize);
        gazePosRef.off("child_changed", visualize);
        gazePosRef.off("child_removed", removeHighlight2);
      } else if (dataType == "mouse") {
        mousePosRef.off("child_added", visualize);
        mousePosRef.off("child_changed", visualize);
        mousePosRef.off("child_removed", removeHighlight2);
      } else {
        console.log("Invalid data type!");
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
        }
      }
      // console.log(`send data state: ${getDataState(window.sendDataState)}`);
    });

    mouseVisSwitch.addEventListener("change", function () {
      if (mouseVisSwitch.checked) {
        if (gazeVisSwitch.checked) {
          gazeVisSwitch.checked = false;
          stopVisualization("gaze");
          clearAllHighlights();
        }
        if (window.visualizationState != 1) window.visualizationState = 1;
        startVisualization("mouse");
      } else {
        if (!gazeVisSwitch.checked) {
          window.visualizationState = 0;
          stopVisualization("mouse");
          clearAllHighlights();
        }
      }
      console.log(`visualization state: ${getDataState(window.visualizationState)}`);
    });

    gazeVisSwitch.addEventListener("change", function () {
      if (gazeVisSwitch.checked) {
        if (mouseVisSwitch.checked) {
          mouseVisSwitch.checked = false;
          stopVisualization("mouse");
          clearAllHighlights();
        }
        if (window.visualizationState != 2) window.visualizationState = 2;
        startVisualization("gaze");
      } else {
        if (!mouseVisSwitch.checked) {
          window.visualizationState = 0;
          stopVisualization("gaze");
          clearAllHighlights();
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


    // fill if empty
    if (firepad.isHistoryEmpty()) {
      firepad.setText("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nunc non blandit massa enim. Aliquet risus feugiat in ante. Nunc sed blandit libero volutpat sed cras ornare. Vehicula ipsum a arcu cursus vitae congue mauris rhoncus. Accumsan sit amet nulla facilisi morbi tempus iaculis. Cras ornare arcu dui vivamus arcu felis bibendum ut tristique. Vitae ultricies leo integer malesuada. Faucibus pulvinar elementum integer enim neque. Ornare quam viverra orci sagittis eu. Enim sed faucibus turpis in eu mi. Maecenas accumsan lacus vel facilisis volutpat. Amet dictum sit amet justo donec enim. Cras sed felis eget velit. Lacus vestibulum sed arcu non odio euismod lacinia at. Pellentesque id nibh tortor id aliquet lectus proin. Tellus molestie nunc non blandit massa enim nec dui nunc. Morbi tempus iaculis urna id volutpat. Tellus in hac habitasse platea dictumst vestibulum. Quis ipsum suspendisse ultrices gravida dictum fusce.\n\nTortor pretium viverra suspendisse potenti nullam ac tortor vitae purus. Donec ac odio tempor orci dapibus ultrices in iaculis. Morbi tristique senectus et netus et malesuada fames ac turpis. Nunc aliquet bibendum enim facilisis. Nisl purus in mollis nunc sed id semper risus in. Eget gravida cum sociis natoque penatibus et magnis dis. Adipiscing elit duis tristique sollicitudin nibh sit amet commodo. Eget mauris pharetra et ultrices neque ornare. Quisque sagittis purus sit amet volutpat. Neque convallis a cras semper auctor neque vitae. Potenti nullam ac tortor vitae purus faucibus. Urna neque viverra justo nec. Commodo nulla facilisi nullam vehicula ipsum a arcu cursus vitae.\n\nElementum integer enim neque volutpat ac tincidunt vitae semper quis. Consectetur adipiscing elit ut aliquam purus. Fames ac turpis egestas sed tempus urna. Ut etiam sit amet nisl purus in mollis nunc sed. Purus sit amet volutpat consequat mauris nunc. Lacus sed viverra tellus in hac habitasse platea dictumst. Ullamcorper a lacus vestibulum sed arcu. Consectetur libero id faucibus nisl tincidunt eget. Vel quam elementum pulvinar etiam. Sagittis id consectetur purus ut faucibus pulvinar elementum. Metus vulputate eu scelerisque felis imperdiet proin fermentum. Auctor eu augue ut lectus. Egestas erat imperdiet sed euismod nisi porta lorem.\n\nLeo duis ut diam quam. Porttitor leo a diam sollicitudin tempor id eu nisl nunc. Eu volutpat odio facilisis mauris sit. Est velit egestas dui id ornare arcu odio ut sem. Arcu risus quis varius quam quisque id. Egestas tellus rutrum tellus pellentesque. Felis eget nunc lobortis mattis aliquam faucibus purus in massa. Quis lectus nulla at volutpat diam ut venenatis tellus. Risus pretium quam vulputate dignissim suspendisse in est ante. Amet facilisis magna etiam tempor. Tortor aliquam nulla facilisi cras. Consequat nisl vel pretium lectus. Tellus elementum sagittis vitae et leo duis. Nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Vitae et leo duis ut diam quam nulla porttitor.\n\nRhoncus mattis rhoncus urna neque viverra justo nec ultrices. Commodo quis imperdiet massa tincidunt nunc pulvinar sapien. Neque volutpat ac tincidunt vitae semper quis lectus nulla. Ornare quam viverra orci sagittis eu volutpat odio facilisis mauris. Id faucibus nisl tincidunt eget nullam non nisi. Malesuada pellentesque elit eget gravida cum. Nec feugiat nisl pretium fusce id velit. Adipiscing enim eu turpis egestas pretium. Velit aliquet sagittis id consectetur purus ut faucibus pulvinar elementum. Fermentum odio eu feugiat pretium nibh. At lectus urna duis convallis convallis tellus id interdum velit. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit. Ornare aenean euismod elementum nisi quis eleifend quam. Iaculis urna id volutpat lacus laoreet non curabitur gravida arcu. Massa tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada. Netus et malesuada fames ac turpis. Pellentesque elit eget gravida cum sociis natoque penatibus et. Id aliquet risus feugiat in. Pretium lectus quam id leo in vitae turpis.\n\nQuis commodo odio aenean sed adipiscing. Porttitor leo a diam sollicitudin tempor id eu nisl nunc. Ut etiam sit amet nisl purus in mollis nunc sed. Quis viverra nibh cras pulvinar mattis. Amet cursus sit amet dictum sit amet justo donec. Velit sed ullamcorper morbi tincidunt ornare massa. Aenean pharetra magna ac placerat vestibulum lectus mauris ultrices. Porta nibh venenatis cras sed felis. Interdum velit euismod in pellentesque massa placerat. Elementum nibh tellus molestie nunc non blandit massa enim nec. Quam viverra orci sagittis eu.\n\nVel risus commodo viverra maecenas accumsan lacus vel facilisis volutpat. Vulputate mi sit amet mauris. Sit amet est placerat in egestas erat imperdiet sed. Nulla posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. Nibh praesent tristique magna sit amet purus gravida quis blandit. Massa massa ultricies mi quis hendrerit dolor magna. Arcu non odio euismod lacinia at. Natoque penatibus et magnis dis parturient montes nascetur ridiculus. Nisl vel pretium lectus quam. Volutpat sed cras ornare arcu. Sit amet massa vitae tortor condimentum. Mattis rhoncus urna neque viverra justo. Nulla at volutpat diam ut venenatis tellus. Ac tortor vitae purus faucibus ornare suspendisse sed nisi. Sed odio morbi quis commodo odio aenean sed adipiscing diam. Ullamcorper sit amet risus nullam eget felis eget nunc. Leo integer malesuada nunc vel risus commodo. Iaculis eu non diam phasellus vestibulum lorem sed risus. Elit at imperdiet dui accumsan sit amet nulla. Molestie a iaculis at erat pellentesque adipiscing commodo elit.\n\nTempus iaculis urna id volutpat lacus laoreet non. Nullam ac tortor vitae purus faucibus. Magnis dis parturient montes nascetur ridiculus mus mauris. Quam elementum pulvinar etiam non. Cursus risus at ultrices mi tempus imperdiet. Aliquam sem fringilla ut morbi tincidunt augue interdum. Fermentum dui faucibus in ornare. Molestie nunc non blandit massa enim nec. Viverra maecenas accumsan lacus vel facilisis volutpat est velit egestas. Urna nec tincidunt praesent semper feugiat nibh sed pulvinar. Egestas congue quisque egestas diam in arcu cursus. Eget dolor morbi non arcu. Mattis molestie a iaculis at. Sed risus ultricies tristique nulla. Quis risus sed vulputate odio ut enim blandit. Aliquam faucibus purus in massa tempor nec.\n\nAt augue eget arcu dictum varius duis at. Tristique senectus et netus et malesuada fames. Venenatis cras sed felis eget velit aliquet sagittis. Euismod elementum nisi quis eleifend quam adipiscing. Non pulvinar neque laoreet suspendisse interdum consectetur libero id. Platea dictumst quisque sagittis purus sit amet volutpat consequat mauris. Feugiat nisl pretium fusce id velit. Pellentesque sit amet porttitor eget dolor. Amet est placerat in egestas erat. Ipsum dolor sit amet consectetur. Turpis massa tincidunt dui ut. Porta non pulvinar neque laoreet suspendisse interdum consectetur libero. Sit amet consectetur adipiscing elit ut aliquam purus sit. Cras semper auctor neque vitae tempus quam. Ultrices gravida dictum fusce ut placerat orci nulla. Adipiscing commodo elit at imperdiet dui. Molestie at elementum eu facilisis sed odio. Amet luctus venenatis lectus magna fringilla urna porttitor rhoncus dolor. Suspendisse ultrices gravida dictum fusce ut placerat.\n\nEu scelerisque felis imperdiet proin fermentum leo vel. Vel quam elementum pulvinar etiam non. Et pharetra pharetra massa massa. Nunc aliquet bibendum enim facilisis gravida neque convallis a cras. Amet commodo nulla facilisi nullam vehicula ipsum. Cras fermentum odio eu feugiat pretium nibh ipsum consequat. Morbi quis commodo odio aenean sed adipiscing diam donec. Id velit ut tortor pretium viverra. Enim sed faucibus turpis in eu mi bibendum neque egestas. Bibendum arcu vitae elementum curabitur vitae nunc sed velit dignissim. Convallis tellus id interdum velit laoreet id donec. Vel fringilla est ullamcorper eget nulla facilisi.");
    }

    var ticking = false;

    function update() {
      // Do something with the scroll position
      for (let id in userColors) {
        if (userId != id) {
          updateHighlight(id);
        } else {
          // update userId location in database
        }
      }
    }

    var scrollbar = document.querySelector(".CodeMirror-vscrollbar");
    scrollbar.addEventListener('scroll', function (e) {
      // console.log('hi');
      // lastKnownScrollPosition = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(function () {
          update();
          ticking = false;
        });

        ticking = true;
      }
    });

  });

  function encodeLocation(xpos, ypos) {
    var cmsizerDim = document.querySelector(".CodeMirror-code").getBoundingClientRect();
    var firepadDim = document.getElementById("firepad").getBoundingClientRect();

    var bodyDim = document.querySelector("body").getBoundingClientRect();

    var relX, relY;
    var region;

    if (xpos <= firepadDim.left) {
      region = 0;
      relX = xpos - bodyDim.left;
      relY = ypos;
    } else if (xpos > firepadDim.left && xpos < cmsizerDim.left) {
      relX = (xpos - firepadDim.left) / (cmsizerDim.left - firepadDim.left);
      if (ypos < 84) {
        region = 1;
        relY = ypos;
      } else {
        region = 4;
        relY = ypos - cmsizerDim.top;
      }
    } else if (xpos >= cmsizerDim.left && xpos <= cmsizerDim.right) {
      relX = xpos - cmsizerDim.left;

      if (ypos < 84) {
        region = 2;
        relY = ypos;
      } else {
        region = 5;
        relY = ypos - cmsizerDim.top;
      }

    } else if (xpos > cmsizerDim.right && xpos < firepadDim.right) {

      relX = (xpos - cmsizerDim.right) / (firepadDim.right - cmsizerDim.right);
      if (ypos < 84) {
        region = 3;
        relY = ypos;
      } else {
        region = 6;
        relY = ypos - cmsizerDim.top;
      }
    } else {
      region = 7;
      relX = xpos - firepadDim.right;
      relY = ypos;
    }

    console.log("sent: { ", "region:", region, ", relX:", relX, ", relY:", relY, ", clientX:", xpos, ", clientY:", ypos, ", cmLeft:", cmsizerDim.left, ", cmTop:", cmsizerDim.top, ", fpLeft:", firepadDim.left, ", fpTop:", firepadDim.top, ", bodyLeft:", bodyDim.left, ", bodyTop:", bodyDim.top, "}");

    return { region: region, x: relX, y: relY }
  }

  function mouseMove(event) {
    if (window.sendDataState == 1 || window.sendDataState == 3) {

      encodedLoc = encodeLocation(event.clientX, event.clientY);
      mousePosRef.child(userId).update(encodedLoc);
    }
  }

  //Callback for when the mouse leaves the target
  function mouseLeave() {
    mousePosRef.child(userId).update({ region: null, x: null, y: null });
  }

  function exists(val) {
    return val !== null && val !== undefined;
  }

  function hex2rgb(hex, transparency) {
    if (typeof hex !== 'string') {
      // console.log(typeof hex);
      throw new TypeError('Expected a string');
    }
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    var num = parseInt(hex, 16);
    var rgb = [num >> 16, num >> 8 & 255, num & 255];
    var type = 'rgb';
    if (exists(transparency)) {
      type = 'rgba';
      rgb.push(transparency);
    }
    // rgb(r, g, b) or rgba(r, g, b, t)
    return type + '(' + rgb.join(',') + ')';
  }

  // visfunc
  function visualize(snapshot) {

    userLocations[snapshot.key] = snapshot.val();
    if (usersChecked[snapshot.key]) {
      if (userColors[snapshot.key]) updateHighlight(snapshot.key);
    } else {
      if (userHighlights[snapshot.key]) removeHighlight(snapshot.key);
    }

  }

  function decodePosition(loc) {
    var region = loc.region;
    var xpos = loc.x;
    var ypos = loc.y;

    var cmsizerDim = document.querySelector(".CodeMirror-code").getBoundingClientRect();
    // console.log(docDimensions.left, docDimensions.top);
    var firepadDim = document.getElementById("firepad").getBoundingClientRect();
    var bodyDim = document.querySelector("body").getBoundingClientRect();

    var relX, relY;

    switch (region) {
      case 0:
        relX = xpos; // bodyDim.left;
        relY = ypos;
        break;
      case 1:
        relX = firepadDim.left - bodyDim.left + (cmsizerDim.left - firepadDim.left) * xpos;
        relY = ypos;
        break;
      case 2:
        relX = xpos + cmsizerDim.left - bodyDim.left;
        relY = ypos;
        break;
      case 3:
        relX = cmsizerDim.right - bodyDim.left + (firepadDim.right - cmsizerDim.right) * xpos;
        relY = ypos;
        break;
      case 4:
        relX = firepadDim.left - bodyDim.left + (cmsizerDim.left - firepadDim.left) * xpos;
        relY = ypos + cmsizerDim.top;
        if (relY < 84) relY = -10000000000;
        break;
      case 5:
        relX = xpos + cmsizerDim.left - bodyDim.left;
        relY = ypos + cmsizerDim.top;
        if (relY < 84) relY = -10000000000;
        break;
      case 6:
        relX = cmsizerDim.right - bodyDim.left + (firepadDim.right - cmsizerDim.right) * xpos;
        relY = ypos + cmsizerDim.top;
        if (relY < 84) relY = -10000000000;
        break;
      case 7:
        relX = xpos + firepadDim.right;
        relY = ypos;
        break;
      default:
        console.log("invalid region");
    }

    console.log("received: { ", "region:", region, ", relX:", xpos, ", relY:", ypos, ", clientX:", relX, ", clientY:", relY, ", cmLeft:", cmsizerDim.left, ", cmTop:", cmsizerDim.top, ", fpLeft:", firepadDim.left, ", fpTop:", firepadDim.top, ", bodyLeft:", bodyDim.left, ", bodyTop:", bodyDim.top, "}");

    return { region: region, x: relX, y: relY }
  }

  function updateHighlight(uID) {
    var circle;
    // var debugStatement;

    if (userHighlights[uID] != null) {
      circle = userHighlights[uID];
      // debugStatement = circle.firstChild;
    } else {
      circle = document.createElement("DIV");
      circle.id = `${uID}`;
      userHighlights[uID] = circle;
      document.body.append(circle);
      // debugStatement = document.createElement("DIV");
      // circle.append(debugStatement);
    }

    var loc = decodePosition(userLocations[uID]);

    if (uID != userId) {
      if (isAboveView(loc)) {
        // console.log("above view!");
        createUpArrow(uID, loc);
      } else if (isBelowView(loc)) {
        // console.log("below view!");
        createDownArrow(uID, loc);
      } else {
        // console.log("in view!");
        clearArrow(uID);
      }
    }

    var transparentColor = hex2rgb(userColors[uID], 0.0);
    var color = hex2rgb(userColors[uID], 1.0);
    var sizeCoeff = document.getElementById("sentenceSlider").value;


    var visShape, visSize;
    if (window.visShape == "circle") {
      visShape = `background-color: ${color}; border-radius: 100%; opacity: 0.5;`;
      visSize = `left: ${loc.x - 8 * sizeCoeff}px; top: ${loc.y - 8 * sizeCoeff}px; width:${16 * sizeCoeff}px; height:${16 * sizeCoeff}px;`;
    } else if (window.visShape == "gradient") {
      visShape = `background: radial-gradient(${color} 0%, ${transparentColor} 66%, ${transparentColor}); opacity: 0.7;`;
      visSize = `left: ${loc.x - 12 * sizeCoeff}px; top: ${loc.y - 12 * sizeCoeff}px; width:${24 * sizeCoeff}px; height:${24 * sizeCoeff}px;`;
    } else {
      console.log("invalid shape!");
    }

    circle.style = `position: absolute; pointer-events: none; ${visSize} ${visShape}`;
    // debugStatement.style = `position:relative; left: 20px; top: 20px; background-color: white; z-index: 2; border-style: solid; border-color: red; border-width: 2px; width: 200px;`
    // debugStatement.innerHTML = `(x,y) = (${loc.x}, ${loc.y})`;
    // console.log(sizeCoeff);
  }

  function removeHighlight(uID) {
    // if (typeof uID != String) uID = uID.key;
    document.body.removeChild(userHighlights[uID]);
    delete userHighlights[uID];
  }

  function removeHighlight2(snapshot) {
    document.body.removeChild(userHighlights[snapshot.key]);
    delete userHighlights[snapshot.key];
  }

  function clearAllHighlights() {
    for (let uID in userHighlights) removeHighlight(uID);
  }

  //Transforms a string hex color to a string rgb color with a fixed opacity
  function hexToRgb(hex) {
    let opacity = 0.35;
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? "rgb(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + "," + opacity + ")" : null;
  }

  //Checks if a highlight is above the client view port
  function isAboveView(loc) {
    return loc.y < 84 && (loc.region == 4 || loc.region == 5 || loc.region == 6);
  }

  //Checks if a highlight is bellow the client view port
  function isBelowView(loc) {
    return loc.y > document.querySelector("body").getBoundingClientRect().height && (loc.region == 4 || loc.region == 5 || loc.region == 6);
  }



  //Creates up arrow indicating a user's highlight is above the view port
  function createUpArrow(uID, loc) {

    var arrow = userArrows[uID];
    if (arrow && arrow.className == "down-arrow") {
      clearArrow(uID);
    }

    if (!userArrows[uID]) {
      var userColorDiv = document.querySelector(`div.firepad-userlist-user.firepad-user-${uID}`).getElementsByClassName("firepad-userlist-color-indicator")[0];
      arrow = document.createElement("div");
      arrow.className = "up-arrow";
      userColorDiv.appendChild(arrow);

      //constructing arrow shape
      var arrowTip = document.createElement("div");
      arrowTip.className = "arrow-up";
      arrow.appendChild(arrowTip);

      var arrowStem = document.createElement("div");
      arrowStem.className = "arrow-stem";
      arrow.appendChild(arrowStem);

      userArrows[uID] = arrow;
    }

  }

  //Creates down arrow indicating a user's highlight is bellow the view port
  function createDownArrow(uID, loc) {

    var arrow = userArrows[uID];
    if (arrow && arrow.className == "up-arrow") {
      clearArrow(uID);
    }

    if (!userArrows[uID]) {
      var userColorDiv = document.querySelector(`div.firepad-userlist-user.firepad-user-${uID}`).getElementsByClassName("firepad-userlist-color-indicator")[0];
      arrow = document.createElement("div");
      arrow.className = "down-arrow";
      userColorDiv.appendChild(arrow);

      //constructing arrow shape

      var arrowStem = document.createElement("div");
      arrowStem.className = "arrow-stem";
      arrow.appendChild(arrowStem);
      var arrowTip = document.createElement("div");
      arrowTip.className = "arrow-down";
      arrow.appendChild(arrowTip);


      userArrows[uID] = arrow;
    }

  }

  //Clears the color indicator of any arrow
  function clearArrow(uID) {
    if (uID in userArrows) {
      var userColorDiv = document.querySelector(`div.firepad-userlist-user.firepad-user-${uID}`).getElementsByClassName("firepad-userlist-color-indicator")[0];
      userColorDiv.removeChild(userArrows[uID]);
      delete userArrows[uID];
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
  var audioElems = {};        // collection of (active) audio elements
  var muteStatus = {};        // collection of mute status for each audio element
  var config = {
    'iceServers': [
      { 'urls': 'stun:stun.services.mozilla.com' },
      { 'urls': 'stun:stun.l.google.com:19302' }
    ]
  };
  var muteBtn = document.getElementById("mute");

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
        muteStatus[snapshot.child("stream_id").val()] = snapshot.child("is_muted").val();
        toggleAudioElement(snapshot.child("stream_id").val());
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
      delete muteStatus[snapshot.child("stream_id").val()];
      delete remoteClients[snapshot.key];
    }
    let streamId = snapshot.child("stream_id").val();
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
    if (muteBtn.innerText == "Mute") {
      // alert('muting')
      voiceRef.child(userId).update({ is_muted: true });
      muteBtn.innerText = "Unmute";
      // for (uId in remoteClients) {
      //   if (remoteClients[uId]["conn"]) remoteClients[uId]["conn"].send(`${userId} mute ${myStream.id}`);
      // }
    } else if (muteBtn.innerText == "Unmute") {
      // alert('unmuting')
      voiceRef.child(userId).update({ is_muted: false });
      muteBtn.innerText = "Mute";
      // for (uId in remoteClients) {
      //   if (remoteClients[uId]["conn"]) remoteClients[uId]["conn"].send(`${userId} unmute ${myStream.id}`);
      // }
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
      if (muteStatus[stream.id]) toggleAudioElement(stream.id);
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
    // console.log(streamId);
    if (audioElems[streamId]) {
      let stream = audioElems[streamId].srcObject;
      stream.getAudioTracks().forEach(function (track) {
        track.enabled = !muteStatus[streamId];
      });
    }
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
          // case "mute":
          //   toggleAudioElement(tmp[2]);
          //   console.log(`muted ${tmp[0]}`);
          //   break;
          // case "unmute":
          //   toggleAudioElement(tmp[2]);
          //   console.log(`unmuted ${tmp[0]}`);
          //   break;
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
          // case "mute":
          //   toggleAudioElement(tmp[2]);
          //   console.log(`muted ${tmp[0]}`);
          //   break;
          // case "unmute":
          //   toggleAudioElement(tmp[2]);
          //   console.log(`unmuted ${tmp[0]}`);
          //   break;
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

