/**
 * visualization-control.js
 *
 * Name: davecarroll, chanhakim, aidangarton, nickmarsano
 * Date: Summer 2020 - Spring 2021
 */

// var URL = window.location.href;
// var participants = URL.search('par');
// if (participants == -1) {
//   participants = 2;
// }
// else {
//   participants = URL.substring(participants + 4, participants + 5);
// }
let default_config = {
  container: document.querySelector("#heatmap"),
  gradient: { 0.25: "rgb(220,220,220)", 0.55: "rgb(169,169,169)", 0.85: "	rgb(128,128,128)", 1.0: "rgb(72,72,72)" },//monochromatic version
  maxOpacity: document.getElementById("hm-opacity-slider").value / 100,//(100 * participants),
  radius: document.getElementById("hm-radius-slider").value,
};

let heatmapDataPoints = [];
let intervalID;
let removalType = document.getElementById("heatmap-type-selector").value;
// let removalRate = document.getElementById("hm-removal-rate-slider").value;
let removalRate = 50;
let capacity = document.getElementById("hm-capacity-slider").value;

let heatmapInstance = h337.create(default_config);

var visualizationControl = (function () {
  var FirepadCM; // reference for our firepad's codemirror instance
  var cmElement; // reference to cmElement
  var userColors = {}; // object for user colors
  var userHighlights = {}; // object for user highlights
  var userLocations = {}; // object for user locations
  var usersChecked = {}; // object for visualization checkboxes
  var userArrows = {}; // object for user arrows

  // references to firebase user mouse and gaze positions
  var mousePosRef = firebaseRef.child("mice");
  var gazePosRef = firebaseRef.child("gaze");

  // sendData and visualization state variables
  // 0 = no active
  // 1 = mouse only
  // 2 = gaze only
  // 3 = mouse and gaze
  window.sendDataState = 0;
  window.visualizationState = 0;

  var visShapeSelector = document.querySelector("#vis-shape");
  window.visShape = visShapeSelector.value;

  visShapeSelector.onchange = function () {
    window.visShape = visShapeSelector.value;
    console.log(`vis shape changed to ${window.visShape}`);

    const hmParamsContainer = document.getElementById(
      "heatmap-params-container"
    );
    const gradientParamsContainer = document.getElementById("gradient-options");

    if (visShapeSelector.value == "heatmap") {
      hmParamsContainer.style.display = "block";
      gradientParamsContainer.style.display = "none";
    } else if (visShapeSelector.value == "gradient") {
      hmParamsContainer.style.display = "none";
      gradientParamsContainer.style.display = "block";
    }
    clearHeatmap();
    if (window.debug) console.log(window.visShape);
  };

  /**
   * Adds callback for unload event.
   */
  window.addEventListener("beforeunload", function () {
    mousePosRef.child(userId).set(null);
    gazePosRef.child(userId).set(null);
    firebaseRef.child("users").child(userId).set(null);

    mousePosRef.child(userId).remove();
    gazePosRef.child(userId).remove();
    firebaseRef.child("users").child(userId).remove();
  });

  /**
   * Initialize the user checkboxes widget in the control panel.
   */
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
    },
  });

  /**
   * startWebGazer starts webgazer.
   */
  var startWebGazer = function () {
    //webgazer.trainModel();
    //Listens for WebGazer gaze predictions, sends to firebase
    console.log("starting webgazer");
    // window.eyeWrite = true;

    webgazer.setRegression("ridge");
    webgazer
      .setGazeListener(function (data, clock) {
        // console.log(data, clock);

        if (
          data == null ||
          window.sendDataState == 0 ||
          window.sendDataState == 1
        ) {
          gazePosRef.child(userId).update({ region: null, x: null, y: null });
        } else {
          // console.log('sending encoded loc!');
          // console.log(data);
          // var encodedLoc = encodeLocation(data.x, data.y);
          var encodedLoc = encodeLocation2(data.x, data.y);
          gazePosRef.child(userId).update(encodedLoc);
          // gazeContent.push('('+encodedLoc.x+','+encodedLoc.y+';'+Date.now()+'),\n');
          gazeContent.push([data.x / window.innerWidth, data.y / window.innerHeight, Date.now()]);
        }
      })
      .begin();

    // webgazer.setRegression('ridge') /* currently must set regression and tracker */
    // .setGazeListener(function(data, clock) {
    //   if (data == null){
    //     return;
    //   }
    //   if(window.sendDataState == 0 || window.sendDataState == 1) {
    //     gazePosRef.child(userId).update({ region: null, x: null, y: null });
    //   } else {
    //     console.log('sending encoded loc!');
    //     console.log(data);
    //     if(isNaN(data.x) || isNaN(data.y) ){return;}
    //     var encodedLoc = encodeLocation(data.x, data.y);

    //     gazePosRef.child(userId).update(encodedLoc);
    //   }
    //   //   console.log(data); /* data is an object containing an x and y key which are the x and y prediction coordinates (no bounds limiting) */
    //   //   console.log(clock); /* elapsed time in milliseconds since webgazer.begin() was called */
    // })
    // // .setStaticVideo(videoLoc)
    // .begin()  // .then(value => value.showPredictionPoints(true));

    // WebGazer specifications
    // webgazer.trainModel();
    webgazer.params.showVideo = false;
    webgazer.params.showGazeDot = false;
    webgazer.params.showFaceOverlay = false;
    webgazer.params.showFaceFeedbackBox = false;
    webgazer.params.showPredictionPoints = false;
  };

  // FirepadCM = firepad.editorAdapter_.cm;
  let topbefore = 0;

  /**
   * Instantiate the Firepad document.
   * Contains firebase callback functions.
   */
  firepad.on("ready", function () {
    //we grab the codemirror instance from firepad now that firepad is ready
    FirepadCM = firepad.editorAdapter_.cm;
    cmElement = FirepadCM.getWrapperElement();

    cmScrollTop = FirepadCM.coordsChar({ left: 0, top: 0 }, "local");
    cmScrollBottom = FirepadCM.coordsChar({ left: 0, top: 600 }, "local"); //just an estimate for initial value

    FirepadCM.on("scroll", function () {
      cmScrollTop = FirepadCM.coordsChar(
        { left: 0, top: FirepadCM.getScrollInfo().top },
        "local"
      );
      cmScrollBottom = FirepadCM.coordsChar(
        {
          left: 0,
          top:
            FirepadCM.getScrollInfo().top +
            FirepadCM.getScrollInfo().clientHeight,
        },
        "local"
      );

      //dead

      const pad = document.getElementsByClassName("CodeMirror-lines")[0];
      const tb = document.getElementsByClassName("firepad-toolbar")[0];

      const { left, right } = pad.getBoundingClientRect();
      const { bottom } = tb.getBoundingClientRect();

      console.log(bottom);

      heatmapDataPoints = heatmapDataPoints.map((dataPoint) => {
        if (
          dataPoint.x >= left &&
          dataPoint.x <= right
          // dataPoint.y >= bottom
        ) {
          let newy = dataPoint.y + (topbefore - FirepadCM.getScrollInfo().top);
          console.log("old y: " + dataPoint.y + " new y: " + newy);
          return {
            x: dataPoint.x,
            y: newy,
            value: dataPoint.value,
          };
        } else {
          return dataPoint;
        }
      });

      heatmapInstance.setData({ data: [] });
      heatmapInstance.setData({ max: 60, min: 0, data: heatmapDataPoints });

      topbefore = FirepadCM.getScrollInfo().top;
    });

    // Firebase listener for when users are added
    firebaseRef.child("users").on("child_added", function (snapshot) {
      userColors[snapshot.key] = snapshot.child("color").val();

      // placeholder to display userId when the name is not ready
      $("#user-checkboxes").append(
        "<option value=" + snapshot.key + ">" + snapshot.key + "</option>"
      );
      $("#user-checkboxes").multiselect("rebuild");
      if (snapshot.key != userId) {
        $("#user-checkboxes").multiselect("select", snapshot.key);
        usersChecked[snapshot.key] = true;
      } else {
        usersChecked[snapshot.key] = false;//CHANGED THIS TO FALSE PLZ
      }

      // listen for when the name attribute is ready
      firebaseRef
        .child("users")
        .child(snapshot.key)
        .on("value", function (snapshot) {
          if (snapshot.child("name").val()) {
            //update the place holder entry
            $(
              "option[value=" + snapshot.key + "]",
              $("#user-checkboxes")
            )[0].label = snapshot.child("name").val();
            $("#user-checkboxes").multiselect("rebuild");

            //remove the listener
            firebaseRef.child("users").child(snapshot.key).off("value");
          }
        });
    });

    // Firebase listener for when usernames are changed
    firebaseRef.child("users").on("child_changed", function (snapshot) {
      if (snapshot.key != userId) {
        var userDiv = document.getElementsByClassName(
          "firepad-user-" + snapshot.key
        )[0];

        if (snapshot.child("name").val()) {
          //update username in checkbox list
          $(
            "option[value=" + snapshot.key + "]",
            $("#user-checkboxes")
          )[0].label = snapshot.child("name").val();
          $("#user-checkboxes").multiselect("rebuild");
          //update username in firepad userlist
          var userNameDiv = userDiv.getElementsByClassName(
            "firepad-userlist-name"
          )[0];
          userNameDiv.innerText = snapshot.child("name").val();
        }

        if (
          userColors[snapshot.key] &&
          userColors[snapshot.key] != snapshot.child("color").val()
        ) {
          userColors[snapshot.key] = snapshot.child("color").val();
          //update color in firepad userlist
          var userColorDiv = userDiv.getElementsByClassName(
            "firepad-userlist-color-indicator"
          )[0];
          userColorDiv.style.backgroundColor = snapshot.child("color").val();
        }
      } else {
        if (
          userColors[snapshot.key] &&
          userColors[snapshot.key] != snapshot.child("color").val()
        ) {
          userColors[snapshot.key] = snapshot.child("color").val();
        }
        if (snapshot.child("name").val()) {
          //update username in checkbox list
          $(
            "option[value=" + snapshot.key + "]",
            $("#user-checkboxes")
          )[0].label = snapshot.child("name").val();
          $("#user-checkboxes").multiselect("rebuild");
        }
      }
    });

    // Firebase listener for when users are removed
    firebaseRef.child("users").on("child_removed", function (snapshot) {
      // remove their color from the local dict
      if (userColors[snapshot.key]) {
        delete userColors[snapshot.key];
      }
      // remove them from local usersChecked dict
      if (usersChecked[snapshot.key]) {
        delete usersChecked[snapshot.key];
      }
      // clear their highlight from the local dict and remove it
      if (userHighlights[snapshot.key]) {
        userHighlights[snapshot.key].clear();
        delete userHighlights[snapshot.key];
      }
      // remove them from the local checkbox list
      $("option[value=" + snapshot.key + "]", $("#user-checkboxes")).remove();
      $("#user-checkboxes").multiselect("rebuild");
    });

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
    window.isWebGazerActive = false;

    // Mouse Listeners
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseleave", mouseLeave);

    //Fetches the buttons responsible for toggling mouse vs. gaze and send vs. block
    // var mouseButton = document.getElementById("mouseButton");
    // var gazeButton = document.getElementById("gazeButton");

    // References to the mouse/gaze send switches
    var mouseSendSwitch = document.getElementById("mouseSendSwitch");
    var gazeSendSwitch = document.getElementById("gazeSendSwitch");

    // References to the mouse/gaze visualization switches
    var mouseVisSwitch = document.getElementById("mouseVisSwitch");
    var gazeVisSwitch = document.getElementById("gazeVisSwitch");

    /**
     * getDataState returns a string representing the current data state.
     *
     * @param {*} val
     * @returns a String representing the current data state.
     */
    function getDataState(val) {
      if (val == 0) return "none";
      else if (val == 1) return "mouse";
      else if (val == 2) return "gaze";
      else return "invalid";
    }

    /**
     * startVisualization takes a data type as input
     * and toggles on the visualization for that data.
     *
     * @param {*} dataType
     */
    function startVisualization(dataType) {
      if (dataType == "gaze") {
        gazePosRef.on("child_added", visualize);
        gazePosRef.on("child_changed", visualize);
        gazePosRef.on("child_removed", removeHighlightWrapper);
      } else if (dataType == "mouse") {
        mousePosRef.on("child_added", visualize);
        mousePosRef.on("child_changed", visualize);
        mousePosRef.on("child_removed", removeHighlightWrapper);
      } else {
        if (window.debug) console.log("Invalid data type!");
      }
    }

    /**
     * stopVisualization takes a data type as input
     * and toggles off the visualization for that data.
     * @param {*} dataType
     */
    function stopVisualization(dataType) {
      if (dataType == "gaze") {
        gazePosRef.off("child_added", visualize);
        gazePosRef.off("child_changed", visualize);
        gazePosRef.off("child_removed", removeHighlightWrapper);
      } else if (dataType == "mouse") {
        mousePosRef.off("child_added", visualize);
        mousePosRef.off("child_changed", visualize);
        mousePosRef.off("child_removed", removeHighlightWrapper);
      } else {
        if (window.debug) console.log("Invalid data type!");
      }
    }

    // Listener for mouse send switch.
    mouseSendSwitch.addEventListener("click", function () {
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
          clearAllHighlights();
        } else {
          window.sendDataState = 0;
          clearAllHighlights();
        }
      }
      console.log(`send data state: ${getDataState(window.sendDataState)}`);
    });

    // Listener for gaze send switch.
    gazeSendSwitch.addEventListener("change", function () {
      if (gazeSendSwitch.checked) {
        // mouseSendSwitch.checked = false;
        if (window.isWebGazerActive == false) {
          window.isWebGazerActive = true;
          startWebGazer();
        }

        if (mouseSendSwitch.checked) {
          window.sendDataState = 3;
        } else {
          window.sendDataState = 2;
        }
      } else {
        if (mouseSendSwitch.checked) {
          window.sendDataState = 1;
          clearAllHighlights();
        } else {
          window.sendDataState = 0;
          clearAllHighlights();
        }
      }
      console.log(`send data state: ${getDataState(window.sendDataState)}`);
    });

    // Listener for mouse visualization switch.
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
      if (window.debug)
        console.log(
          `visualization state: ${getDataState(window.visualizationState)}`
        );
    });

    // Listener for gaze visualization switch.
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
      if (window.debug)
        console.log(
          `visualization state: ${getDataState(window.visualizationState)}`
        );
    });

    // fill the document if empty
    // [20210516 ck]: massive lorem ipsum text for dev purposes, delete before deploying
    if (firepad.isHistoryEmpty()) {
      firepad.setText(
        "Welcome to EyeWrite!\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nunc non blandit massa enim. Aliquet risus feugiat in ante. Nunc sed blandit libero volutpat sed cras ornare. Vehicula ipsum a arcu cursus vitae congue mauris rhoncus. Accumsan sit amet nulla facilisi morbi tempus iaculis. Cras ornare arcu dui vivamus arcu felis bibendum ut tristique. Vitae ultricies leo integer malesuada. Faucibus pulvinar elementum integer enim neque. Ornare quam viverra orci sagittis eu. Enim sed faucibus turpis in eu mi. Maecenas accumsan lacus vel facilisis volutpat. Amet dictum sit amet justo donec enim. Cras sed felis eget velit. Lacus vestibulum sed arcu non odio euismod lacinia at. Pellentesque id nibh tortor id aliquet lectus proin. Tellus molestie nunc non blandit massa enim nec dui nunc. Morbi tempus iaculis urna id volutpat. Tellus in hac habitasse platea dictumst vestibulum. Quis ipsum suspendisse ultrices gravida dictum fusce.\n\nTortor pretium viverra suspendisse potenti nullam ac tortor vitae purus. Donec ac odio tempor orci dapibus ultrices in iaculis. Morbi tristique senectus et netus et malesuada fames ac turpis. Nunc aliquet bibendum enim facilisis. Nisl purus in mollis nunc sed id semper risus in. Eget gravida cum sociis natoque penatibus et magnis dis. Adipiscing elit duis tristique sollicitudin nibh sit amet commodo. Eget mauris pharetra et ultrices neque ornare. Quisque sagittis purus sit amet volutpat. Neque convallis a cras semper auctor neque vitae. Potenti nullam ac tortor vitae purus faucibus. Urna neque viverra justo nec. Commodo nulla facilisi nullam vehicula ipsum a arcu cursus vitae.\n\nElementum integer enim neque volutpat ac tincidunt vitae semper quis. Consectetur adipiscing elit ut aliquam purus. Fames ac turpis egestas sed tempus urna. Ut etiam sit amet nisl purus in mollis nunc sed. Purus sit amet volutpat consequat mauris nunc. Lacus sed viverra tellus in hac habitasse platea dictumst. Ullamcorper a lacus vestibulum sed arcu. Consectetur libero id faucibus nisl tincidunt eget. Vel quam elementum pulvinar etiam. Sagittis id consectetur purus ut faucibus pulvinar elementum. Metus vulputate eu scelerisque felis imperdiet proin fermentum. Auctor eu augue ut lectus. Egestas erat imperdiet sed euismod nisi porta lorem.\n\nLeo duis ut diam quam. Porttitor leo a diam sollicitudin tempor id eu nisl nunc. Eu volutpat odio facilisis mauris sit. Est velit egestas dui id ornare arcu odio ut sem. Arcu risus quis varius quam quisque id. Egestas tellus rutrum tellus pellentesque. Felis eget nunc lobortis mattis aliquam faucibus purus in massa. Quis lectus nulla at volutpat diam ut venenatis tellus. Risus pretium quam vulputate dignissim suspendisse in est ante. Amet facilisis magna etiam tempor. Tortor aliquam nulla facilisi cras. Consequat nisl vel pretium lectus. Tellus elementum sagittis vitae et leo duis. Nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Vitae et leo duis ut diam quam nulla porttitor.\n\nRhoncus mattis rhoncus urna neque viverra justo nec ultrices. Commodo quis imperdiet massa tincidunt nunc pulvinar sapien. Neque volutpat ac tincidunt vitae semper quis lectus nulla. Ornare quam viverra orci sagittis eu volutpat odio facilisis mauris. Id faucibus nisl tincidunt eget nullam non nisi. Malesuada pellentesque elit eget gravida cum. Nec feugiat nisl pretium fusce id velit. Adipiscing enim eu turpis egestas pretium. Velit aliquet sagittis id consectetur purus ut faucibus pulvinar elementum. Fermentum odio eu feugiat pretium nibh. At lectus urna duis convallis convallis tellus id interdum velit. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit. Ornare aenean euismod elementum nisi quis eleifend quam. Iaculis urna id volutpat lacus laoreet non curabitur gravida arcu. Massa tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada. Netus et malesuada fames ac turpis. Pellentesque elit eget gravida cum sociis natoque penatibus et. Id aliquet risus feugiat in. Pretium lectus quam id leo in vitae turpis.\n\nQuis commodo odio aenean sed adipiscing. Porttitor leo a diam sollicitudin tempor id eu nisl nunc. Ut etiam sit amet nisl purus in mollis nunc sed. Quis viverra nibh cras pulvinar mattis. Amet cursus sit amet dictum sit amet justo donec. Velit sed ullamcorper morbi tincidunt ornare massa. Aenean pharetra magna ac placerat vestibulum lectus mauris ultrices. Porta nibh venenatis cras sed felis. Interdum velit euismod in pellentesque massa placerat. Elementum nibh tellus molestie nunc non blandit massa enim nec. Quam viverra orci sagittis eu.\n\nVel risus commodo viverra maecenas accumsan lacus vel facilisis volutpat. Vulputate mi sit amet mauris. Sit amet est placerat in egestas erat imperdiet sed. Nulla posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. Nibh praesent tristique magna sit amet purus gravida quis blandit. Massa massa ultricies mi quis hendrerit dolor magna. Arcu non odio euismod lacinia at. Natoque penatibus et magnis dis parturient montes nascetur ridiculus. Nisl vel pretium lectus quam. Volutpat sed cras ornare arcu. Sit amet massa vitae tortor condimentum. Mattis rhoncus urna neque viverra justo. Nulla at volutpat diam ut venenatis tellus. Ac tortor vitae purus faucibus ornare suspendisse sed nisi. Sed odio morbi quis commodo odio aenean sed adipiscing diam. Ullamcorper sit amet risus nullam eget felis eget nunc. Leo integer malesuada nunc vel risus commodo. Iaculis eu non diam phasellus vestibulum lorem sed risus. Elit at imperdiet dui accumsan sit amet nulla. Molestie a iaculis at erat pellentesque adipiscing commodo elit.\n\nTempus iaculis urna id volutpat lacus laoreet non. Nullam ac tortor vitae purus faucibus. Magnis dis parturient montes nascetur ridiculus mus mauris. Quam elementum pulvinar etiam non. Cursus risus at ultrices mi tempus imperdiet. Aliquam sem fringilla ut morbi tincidunt augue interdum. Fermentum dui faucibus in ornare. Molestie nunc non blandit massa enim nec. Viverra maecenas accumsan lacus vel facilisis volutpat est velit egestas. Urna nec tincidunt praesent semper feugiat nibh sed pulvinar. Egestas congue quisque egestas diam in arcu cursus. Eget dolor morbi non arcu. Mattis molestie a iaculis at. Sed risus ultricies tristique nulla. Quis risus sed vulputate odio ut enim blandit. Aliquam faucibus purus in massa tempor nec.\n\nAt augue eget arcu dictum varius duis at. Tristique senectus et netus et malesuada fames. Venenatis cras sed felis eget velit aliquet sagittis. Euismod elementum nisi quis eleifend quam adipiscing. Non pulvinar neque laoreet suspendisse interdum consectetur libero id. Platea dictumst quisque sagittis purus sit amet volutpat consequat mauris. Feugiat nisl pretium fusce id velit. Pellentesque sit amet porttitor eget dolor. Amet est placerat in egestas erat. Ipsum dolor sit amet consectetur. Turpis massa tincidunt dui ut. Porta non pulvinar neque laoreet suspendisse interdum consectetur libero. Sit amet consectetur adipiscing elit ut aliquam purus sit. Cras semper auctor neque vitae tempus quam. Ultrices gravida dictum fusce ut placerat orci nulla. Adipiscing commodo elit at imperdiet dui. Molestie at elementum eu facilisis sed odio. Amet luctus venenatis lectus magna fringilla urna porttitor rhoncus dolor. Suspendisse ultrices gravida dictum fusce ut placerat.\n\nEu scelerisque felis imperdiet proin fermentum leo vel. Vel quam elementum pulvinar etiam non. Et pharetra pharetra massa massa. Nunc aliquet bibendum enim facilisis gravida neque convallis a cras. Amet commodo nulla facilisi nullam vehicula ipsum. Cras fermentum odio eu feugiat pretium nibh ipsum consequat. Morbi quis commodo odio aenean sed adipiscing diam donec. Id velit ut tortor pretium viverra. Enim sed faucibus turpis in eu mi bibendum neque egestas. Bibendum arcu vitae elementum curabitur vitae nunc sed velit dignissim. Convallis tellus id interdum velit laoreet id donec. Vel fringilla est ullamcorper eget nulla facilisi."
      );

      // hard reset the font style, font size, and line height
      cmElement.style.fontFamily = "Arial";
      cmElement.style.fontSize = "14px";
      cmElement.style.lineHeight = "1.2";
      FirepadCM.refresh();
    }

    // hard reset the font style, font size, and line height
    cmElement.style.fontFamily = "Arial";
    cmElement.style.fontSize = "14px";
    cmElement.style.lineHeight = "1.2";
    FirepadCM.refresh();

    // ticking variable and update function for updating user highlight on scroll event
    var ticking = false;
    function update() {
      for (let id in userColors) {
        if (userId != id) {
          updateHighlight(id);
        } else {
          // update userId location in database
        }
      }
    }

    /**
     * Reference to scrollbar and listener for scroll event.
     */
    var scrollbar = document.querySelector(".CodeMirror-vscrollbar");
    scrollbar.addEventListener("scroll", function (e) {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          update();
          ticking = false;
        });
        ticking = true;
      }
    });
    parseURLFor();
  });

  /**
   * The visualize function is the callback function for visualizing
   * user location data from the Firebase database.
   *
   * @param {*} snapshot
   */
  function visualize(snapshot) {
    userLocations[snapshot.key] = snapshot.val();
    if (usersChecked[snapshot.key]) {
      if (userColors[snapshot.key]) updateHighlight(snapshot.key);
    } else {
      if (userHighlights[snapshot.key]) removeHighlight(snapshot.key);
    }
  }

  /**
   * encodeLocation takes the local client's x and y positions as input
   * and encodes the location based on which region of the document the
   * location is in.
   *
   * @param {Float} xpos
   * @param {Float} ypos
   * @returns
   */
  function encodeLocation(xpos, ypos) {
    var cmsizerDim = document
      .querySelector(".CodeMirror-code")
      .getBoundingClientRect();
    var firepadDim = document.getElementById("firepad").getBoundingClientRect();
    var bodyDim = document.querySelector("body").getBoundingClientRect();

    var relX, relY;
    var region;

    if (xpos <= firepadDim.left) {
      // if the location is in the left panel
      region = 0;
      relX = xpos - bodyDim.left;
      relY = ypos;
    } else if (xpos > firepadDim.left && xpos < cmsizerDim.left) {
      // if the location is in the blank region left of the document
      relX = (xpos - firepadDim.left) / (cmsizerDim.left - firepadDim.left);
      if (ypos < 84) {
        region = 1;
        relY = ypos;
      } else {
        region = 4;
        relY = ypos - cmsizerDim.top;
      }
    } else if (xpos >= cmsizerDim.left && xpos <= cmsizerDim.right) {
      // if the location is within the Firepad document
      relX = xpos - cmsizerDim.left;
      if (ypos < 84) {
        region = 2;
        relY = ypos;
      } else {
        region = 5;
        relY = ypos - cmsizerDim.top;
      }
    } else if (xpos > cmsizerDim.right && xpos < firepadDim.right) {
      // if the location is in the blank region right of the document
      relX = (xpos - cmsizerDim.right) / (firepadDim.right - cmsizerDim.right);
      if (ypos < 84) {
        region = 3;
        relY = ypos;
      } else {
        region = 6;
        relY = ypos - cmsizerDim.top;
      }
    } else {
      // if the location is beyond the right-hand blank region
      region = 7;
      relX = xpos - firepadDim.right;
      relY = ypos;
    }

    if (window.debug)
      console.log(
        "sent: { ",
        "region:",
        region,
        ", relX:",
        relX,
        ", relY:",
        relY,
        ", clientX:",
        xpos,
        ", clientY:",
        ypos,
        ", cmLeft:",
        cmsizerDim.left,
        ", cmTop:",
        cmsizerDim.top,
        ", fpLeft:",
        firepadDim.left,
        ", fpTop:",
        firepadDim.top,
        ", bodyLeft:",
        bodyDim.left,
        ", bodyTop:",
        bodyDim.top,
        "}"
      );

    return { region: region, x: relX, y: relY };
  }

  /**
   * decodeLocation decodes a location into the local user's document view.
   * @param {*} loc an object containing the (x,y) position and region of
   * the incoming user's location
   * @returns a decoded location
   */
  function decodeLocation(loc) {
    var region = loc.region;
    var xpos = loc.x;
    var ypos = loc.y;

    var cmsizerDim = document
      .querySelector(".CodeMirror-code")
      .getBoundingClientRect();
    var firepadDim = document.getElementById("firepad").getBoundingClientRect();
    var bodyDim = document.querySelector("body").getBoundingClientRect();

    var relX, relY;

    switch (region) {
      case 0:
        relX = xpos; // bodyDim.left;
        relY = ypos;
        break;
      case 1:
        relX =
          firepadDim.left -
          bodyDim.left +
          (cmsizerDim.left - firepadDim.left) * xpos;
        relY = ypos;
        break;
      case 2:
        relX = xpos + cmsizerDim.left - bodyDim.left;
        relY = ypos;
        break;
      case 3:
        relX =
          cmsizerDim.right -
          bodyDim.left +
          (firepadDim.right - cmsizerDim.right) * xpos;
        relY = ypos;
        break;
      case 4:
        relX =
          firepadDim.left -
          bodyDim.left +
          (cmsizerDim.left - firepadDim.left) * xpos;
        relY = ypos + cmsizerDim.top;
        if (relY < 84) relY = -10000000000;
        break;
      case 5:
        relX = xpos + cmsizerDim.left - bodyDim.left;
        relY = ypos + cmsizerDim.top;
        if (relY < 84) relY = -10000000000;
        break;
      case 6:
        relX =
          cmsizerDim.right -
          bodyDim.left +
          (firepadDim.right - cmsizerDim.right) * xpos;
        relY = ypos + cmsizerDim.top;
        if (relY < 84) relY = -10000000000;
        break;
      case 7:
        relX = xpos + firepadDim.right;
        relY = ypos;
        break;
      default:
        if (window.debug) console.log("invalid region");
    }

    if (window.debug)
      console.log(
        "received: { ",
        "region:",
        region,
        ", relX:",
        xpos,
        ", relY:",
        ypos,
        ", clientX:",
        relX,
        ", clientY:",
        relY,
        ", cmLeft:",
        cmsizerDim.left,
        ", cmTop:",
        cmsizerDim.top,
        ", fpLeft:",
        firepadDim.left,
        ", fpTop:",
        firepadDim.top,
        ", bodyLeft:",
        bodyDim.left,
        ", bodyTop:",
        bodyDim.top,
        "}"
      );

    return { region: region, x: relX, y: relY };
  }

  /**
   * mouseMove is the callback function for mouse movements.
   * It updates only when the local user has enabled sharing mouse location.
   * @param event
   */
  function mouseMove(event) {
    // encodedLoc = encodeLocation(event.clientX, event.clientY);
    encodedLoc = encodeLocation2(event.clientX, event.clientY);
    if (window.sendDataState == 1 || window.sendDataState == 3) {
      mousePosRef.child(userId).update(encodedLoc);
    }
    // mouseContent.push('('+(event.clientX/window.innerWidth)+','+(event.clientY/window.innerHeight)+';'+Date.now()+'),\n');
    mouseContent.push([event.clientX / window.innerWidth, event.clientY / window.innerHeight, Date.now()]);
  }



  /**
   * mouseLeave is the callback function for when the mouse leaves the viewport.
   * It sets the local user's mouse location in the database to null.
   */
  function mouseLeave(event) {
    mousePosRef.child(userId).remove();
  }

  /**
   * exists checks whether a value exists.
   *
   * @param {*} val
   * @returns true if the val is not null and not undefined.
   */
  function exists(val) {
    return val !== null && val !== undefined;
  }

  /**
   * hex2rgb converts a hex code to its corresponding rgb color.
   *
   * @param {*} hex
   * @param {*} transparency
   * @returns rgb color corresponding to hex and transparency inputs
   */
  function hex2rgb(hex, transparency) {
    if (typeof hex !== "string") {
      // if (window.debug) console.log(typeof hex);
      throw new TypeError("Expected a string");
    }
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    var num = parseInt(hex, 16);
    var rgb = [num >> 16, (num >> 8) & 255, num & 255];
    var type = "rgb";
    if (exists(transparency)) {
      type = "rgba";
      rgb.push(transparency);
    }
    return type + "(" + rgb.join(",") + ")";
  }

  /**
   * updateHighlight takes a user ID as input and updates the corresponding
   * user's highlight on the local user's display.
   *
   * @param {*} uID
   */
  function updateHighlight(uID) {
    var circle;

    if (userHighlights[uID] != null) {
      circle = userHighlights[uID];
    } else {
      circle = document.createElement("DIV");
      circle.id = `${uID}`;
      userHighlights[uID] = circle;
      document.body.append(circle);
    }

    // var hPos = decodeLocation(userLocations[uID]);
    var hPos = decodeLocation2(userLocations[uID]);

    //commented out for ImageSearch
    // if (uID != userId) {
    //   if (isAboveView(hPos)) {
    //     if (window.debug) console.log("above view!");
    //     createUpArrow(uID, hPos);
    //   } else if (isBelowView(hPos)) {
    //     if (window.debug) console.log("below view!");
    //     createDownArrow(uID, hPos);
    //   } else {
    //     if (window.debug) console.log("in view!");
    //     clearArrow(uID);
    //   }
    // }

    var hColor = hex2rgb(userColors[uID], 1.0);
    var hSize = { coeff: document.getElementById("sentenceSlider").value };
    var hrate = { coeff: document.getElementById("sentenceSlider2").value };
    // var visShape, visSize;
    if (window.visShape == "solid") {
      circle.style = createSolidCircleHighlightStyle(hPos, hSize, hColor);

      // get rid of clearing heatmap interval and clear heatmap data from screen
      clearInterval(intervalID);
      intervalID = null;
      heatmapInstance.setData({ data: [] });
    } else if (window.visShape == "hollow") {
      circle.style = createHollowCircleHighlightStyle(hPos, hSize, hColor);

      // get rid of clearing heatmap interval and clear heatmap data from screen
      clearInterval(intervalID);
      intervalID = null;
      heatmapInstance.setData({ data: [] });
    } else if (window.visShape == "gradient") {
      circle.style = createGradientCircleHighlightStyle(
        hPos,
        hSize,
        hColor,
        hrate
      );
      // get rid of clearing heatmap interval and clear heatmap data from screen
      clearInterval(intervalID);
      intervalID = null;

      heatmapInstance.setData({ data: [] });
    } else if (window.visShape == "heatmap") {
      circle.style.visibility = "hidden";

      if (removalType == "temporal") {
        if (intervalID == null || intervalID == undefined) {
          intervalID = window.setInterval(() => {
            heatmapDataPoints.shift();
            heatmapInstance.setData({
              max: 60,
              min: 0,
              data: heatmapDataPoints,
            });
            // console.log(heatmapDataPoints.length);
            // if (heatmapDataPoints.length == 0) {
            //   clearInterval(intervalID);
            //   intervalID = null;
            // }
          }, removalRate);
        }

        heatmapDataPoints.push({
          x: Math.round(hPos.x),
          y: Math.round(hPos.y),
          value: 20,
        });
        heatmapInstance.setData({ max: 60, min: 0, data: heatmapDataPoints });
      } else if (removalType == "capacity") {
        if (intervalID != null) {
          clearInterval(intervalID);
          intervalID = null;
        }

        if (heatmapDataPoints.length == capacity) {
          heatmapDataPoints.shift();
        }

        if (heatmapDataPoints.length > capacity) {
          for (let i = 0; i < heatmapDataPoints.length - capacity + 2; i++) {
            heatmapDataPoints.shift();
          }
        }

        heatmapDataPoints.push({
          x: Math.round(hPos.x),
          y: Math.round(hPos.y),
          value: 20,
        });

        heatmapInstance.setData({ max: 60, min: 0, data: heatmapDataPoints });

      } else if (removalType == "none") {
        if (intervalID != null) {
          clearInterval(intervalID);
          intervalID = null;
        }
        heatmapDataPoints.push({
          x: Math.round(hPos.x),
          y: Math.round(hPos.y),
          value: 20,
        });
        heatmapInstance.setData({ max: 60, min: 0, data: heatmapDataPoints });
      }
    } else {
      if (window.debug) console.log("invalid shape!");
    }
  }

  /**
   * removeHighlight takes a user ID as input and removes the corresponding
   * user's highlight from the local user's display.
   *
   * @param {*} uID
   */
  function removeHighlight(uID) {
    document.body.removeChild(userHighlights[uID]);
    delete userHighlights[uID];
  }

  /**
   * removeHighlightWrapper wraps the removeHighlight function so that
   * it can be used as a Firebase callback.
   *
   * @param {*} snapshot
   */
  function removeHighlightWrapper(snapshot) {
    removeHighlight(snapshot.key);
  }

  /**
   * clearAllHighlights calls removeHighlight on all users.
   */
  function clearAllHighlights() {
    for (let uID in userHighlights) removeHighlight(uID);
  }

  /**
   * isAboveView takes a location as input
   * and returns true if the location is above
   * the current viewport
   * @param {*} loc
   * @returns true if the location is above the current viewport
   */
  function isAboveView(loc) {
    return (
      loc.y < 84 && (loc.region == 4 || loc.region == 5 || loc.region == 6)
    );
  }

  /**
   * isBelowView takes a location as input
   * and returns true if the location is below
   * the current viewport
   *
   * @param {*} loc
   * @returns true if the location is below the current viewport
   */
  function isBelowView(loc) {
    return (
      loc.y > document.querySelector("body").getBoundingClientRect().height &&
      (loc.region == 4 || loc.region == 5 || loc.region == 6)
    );
  }

  /**
   * createUpArrow takes a user ID and location as input and
   * creates an up arrow in the corresponding user's color
   * square in the user list
   * @param {*} uID
   * @param {*} loc
   */
  function createUpArrow(uID, loc) {
    var arrow = userArrows[uID]; // ref to user arrow

    // clear it if it exists
    if (arrow && arrow.className == "down-arrow") {
      clearArrow(uID);
    }

    // draw the user arrow
    if (!userArrows[uID]) {
      var userColorDiv = document
        .querySelector(`div.firepad-userlist-user.firepad-user-${uID}`)
        .getElementsByClassName("firepad-userlist-color-indicator")[0];
      arrow = document.createElement("div");
      arrow.className = "up-arrow";
      userColorDiv.appendChild(arrow);

      // construct up arrow shape
      var arrowTip = document.createElement("div");
      arrowTip.className = "arrow-up";
      arrow.appendChild(arrowTip);
      var arrowStem = document.createElement("div");
      arrowStem.className = "arrow-stem";
      arrow.appendChild(arrowStem);

      userArrows[uID] = arrow;
    }
  }

  /**
   * createDownArrow takes a user ID and location as input
   * and creates a down arrow over the corresponding user's
   * color square in the user list
   *
   * @param {*} uID
   * @param {*} loc
   */
  function createDownArrow(uID, loc) {
    var arrow = userArrows[uID]; // ref to user arrow

    // clear it if it exists
    if (arrow && arrow.className == "up-arrow") {
      clearArrow(uID);
    }

    // create the arrow
    if (!userArrows[uID]) {
      var userColorDiv = document
        .querySelector(`div.firepad-userlist-user.firepad-user-${uID}`)
        .getElementsByClassName("firepad-userlist-color-indicator")[0];
      arrow = document.createElement("div");
      arrow.className = "down-arrow";
      userColorDiv.appendChild(arrow);

      // construct the arrow shape
      var arrowStem = document.createElement("div");
      arrowStem.className = "arrow-stem";
      arrow.appendChild(arrowStem);
      var arrowTip = document.createElement("div");
      arrowTip.className = "arrow-down";
      arrow.appendChild(arrowTip);

      userArrows[uID] = arrow;
    }
  }

  /**
   * clearArrow takes a user ID as input and clears the
   * corresponding user's arrow from the user list.
   *
   * @param {*} uID
   */
  function clearArrow(uID) {
    if (uID in userArrows) {
      var userColorDiv = document
        .querySelector(`div.firepad-userlist-user.firepad-user-${uID}`)
        .getElementsByClassName("firepad-userlist-color-indicator")[0];
      userColorDiv.removeChild(userArrows[uID]);
      delete userArrows[uID];
    }
  }

  function encodeLocation2(x,y){
    return { region: 0, x: x/window.innerWidth, y: y/window.innerHeight }
  }

  function decodeLocation2(loc){
    return {x:loc.x*window.innerWidth, y:loc.y*window.innerHeight};
  }

})();

function updateHeatmapStyle(new_config) {
  // default_config = new_config;
  // let new_heatmap = h337.create(new_config);
  // new_heatmap.setData({ data: heatmapDataPoints });
  // heatmapDataPoints = [];
  // heatmapInstance.setData({ max: 100, min: 100, data: [] });
  // heatmapInstance = new_heatmap;
  // heatmapInstance = h337.create(new_config);
  /////
  // heatmapDataPoints = [];
  // heatmapInstance.setData({ data: [] });
  // default_config = new_config;
  // heatmapInstance = h337.create(default_config);
  /////
  default_config = new_config;
  let d = heatmapInstance.getData();
  heatmapInstance.setData({ max: 60, min: 0, data: [] });

  let new_heatmap = h337.create(new_config);
  heatmapInstance.setData({ max: 60, min: 0, data: d });
  heatmapInstance = new_heatmap;
  heatmapInstance.setData({ max: 60, min: 0, data: heatmapDataPoints });
}

function clearHeatmap() {
  heatmapDataPoints = [];
  heatmapInstance.setData({ max: 60, min: 0, data: [] });
}

window.onresize = function () {
  heatmapInstance._renderer.setDimensions(
    document.body.clientWidth,
    document.body.clientHeight
  );
  heatmapInstance.repaint();
};

