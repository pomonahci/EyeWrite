/**
 * ui-adjustments.js handles some UI customization
 *
 * Name: davecarroll, chanhakim, aidangarton, nickmarsano
 * Date: Summer 2020
 */

var UIAdjustments = (function () {
  firepadUserList.firebaseOff_(
    firebaseRef.child("users"),
    "child_changed",
    firepadUserList["firebaseCallbacks_"][4]["callback"]
  );

  var logo = document.getElementsByClassName("powered-by-firepad")[0];
  logo.parentNode.removeChild(logo);

  document.getElementsByClassName("firepad-userlist-name-hint")[0].style.top =
    "20px";

  var userlistBox = document.getElementsByClassName("firepad-userlist")[0];
  userlistBox.className += " userlist-box";

  var userlist = document.getElementsByClassName("firepad-userlist-users")[0];
  userlist.style.height =
    userlistBox.offsetHeight +
    userlistBox.offsetTop -
    userlist.offsetTop +
    "px";
  userlist.style.overflowY = "scroll";

  var colorEditPencilIcon = document.createElement("img");
  colorEditPencilIcon.id = "color-edit-pencil-icon";
  colorEditPencilIcon.src = "./graphics/pencil.png";

  var el = document.createElement("button");
  el.className = "colorpicker-button";
  el.appendChild(colorEditPencilIcon);

  var colorPicker = document.createElement("div");
  colorPicker.appendChild(el);

  var thisUserColorIndicator = document.getElementsByClassName(
    "firepad-user-" + userId
  )[0];
  thisUserColorIndicator.appendChild(colorPicker);

  const pickr = new Pickr(
    Object.assign({
      el,
      theme: "nano",
      useAsButton: true,
      default: "#000000",
      swatches: null,
      defaultRepresentation: "HEXA",
      components: {
        preview: true,
        opacity: false,
        hue: true,
        interaction: {
          hex: false,
          rgba: false,
          hsva: false,
          input: true,
          clear: false,
          save: true,
        },
      },
    })
  );

  //Assigns color picker color to user color div
  firepad.on("ready", function () {
    pickr.on("save", (color) => {
      if (color) {
        firepad.firebaseAdapter_.setColor(color.toHEXA().toString());
      }
      //hides pickr after pressing save
      pickr.hide();
    });
  });

  firebaseRef
    .child("users")
    .child(userId)
    .on("value", function (snapshot) {
      if (snapshot.child("color").val()) {
        //update the place holder entry
        pickr.setColor(snapshot.child("color").val());

        //remove the listener
        firebaseRef.child("users").child(userId).off("value");
      }
    });

  var slider = document.getElementById("sentenceSlider");
  var output = document.getElementById("numSentences");
  output.innerHTML = slider.value;

  slider.oninput = function () {
    output.innerHTML = this.value;
  };

  var slider2 = document.getElementById("sentenceSlider2");
  var output2 = document.getElementById("numSentences2");
  output2.innerHTML = slider2.value + "  ";

  slider2.oninput = function () {
    var val = Math.floor((this.value / 66) * 100);
    output2.innerHTML = val + "%";
  };

  slider2.onload = function () {
    var val = Math.floor((this.value / 66) * 100);
    output2.innerHTML = val + "%";
  };

  var slider3 = document.getElementById("hm-radius-slider");
  var output3 = document.getElementById("hm-radius");
  output3.innerHTML = slider3.value;

  // var URL = window.location.href;
  // var participants = URL.search('par');
  // if (participants == -1) {
  //   participants = 2;
  // }
  // else {
  //   participants = URL.substring(participants + 4, participants + 5);
  // }
  slider3.oninput = function () {
    output3.innerHTML = this.value;
    updateHeatmapStyle({
      container: document.querySelector("#heatmap"),
      gradient: { 0.25: "rgb(220,220,220)", 0.55: "rgb(169,169,169)", 0.85: "	rgb(128,128,128)", 1.0: "rgb(72,72,72)" },//monochromatic version
      radius: document.getElementById("hm-radius-slider").value,
      maxOpacity: document.getElementById("hm-opacity-slider").value / 100,//(100 * participants),
      blur: document.getElementById("hm-blur-slider").value / 100,
    });
  };

  var slider4 = document.getElementById("hm-opacity-slider");
  var output4 = document.getElementById("hm-opacity");
  output4.innerHTML = slider4.value + "%";

  slider4.oninput = function () {
    output4.innerHTML = this.value + "%";
    updateHeatmapStyle({
      container: document.querySelector("#heatmap"),
      gradient: { 0.25: "rgb(220,220,220)", 0.55: "rgb(169,169,169)", 0.85: "	rgb(128,128,128)", 1.0: "rgb(72,72,72)" },//monochromatic version
      radius: document.getElementById("hm-radius-slider").value,
      maxOpacity: document.getElementById("hm-opacity-slider").value / 100,//(100 * participants),
      blur: document.getElementById("hm-blur-slider").value / 100,
    });
  };

  var slider5 = document.getElementById("hm-blur-slider");
  var output5 = document.getElementById("hm-blur");
  output5.innerHTML = slider5.value;

  slider5.oninput = function () {
    output5.innerHTML = this.value;
    updateHeatmapStyle({
      container: document.querySelector("#heatmap"),
      gradient: { 0.25: "rgb(220,220,220)", 0.55: "rgb(169,169,169)", 0.85: "	rgb(128,128,128)", 1.0: "rgb(72,72,72)" },//monochromatic version
      radius: document.getElementById("hm-radius-slider").value,
      maxOpacity: document.getElementById("hm-opacity-slider").value / 100,//(100 * participants),
      blur: document.getElementById("hm-blur-slider").value / 100,
    });
  };

  var removalRateSlider = document.getElementById("hm-removal-rate-slider");
  var removalRateText = document.getElementById("hm-removal-rate");
  removalRateText.innerHTML = removalRateSlider.value;

  // removalRateSlider.oninput = function () {
  //   removalRateText.innerHTML = removalRateSlider.value;
  //   removalRate = parseInt(removalRateSlider.value);
  // };

  // removalRateSlider.onchange = function () {
  //   clearInterval(intervalID);
  //   if (removalType == "temporal") {
  //     if (intervalID == null || intervalID == undefined) {
  //       intervalID = window.setInterval(() => {
  //         heatmapDataPoints.shift();
  //         heatmapInstance.setData({
  //           max: 60,
  //           min: 0,
  //           data: heatmapDataPoints,
  //         });
  //         // console.log(heatmapDataPoints.length);
  //         // if (heatmapDataPoints.length == 0) {
  //         //   clearInterval(intervalID);
  //         //   intervalID = null;
  //         // }
  //       }, removalRate);
  //     }
  //   }
  // };

  const hmSwitch = document.getElementById("heatmap-type-selector");

  hmSwitch.onchange = function () {
    removalType = hmSwitch.value;

    if (removalType == "temporal") {
      document.getElementById("hm-capacity-div").style.display = "none";
      document.getElementById("hm-removal-rate-div").style.display = "block";
    } else if (removalType == "capacity") {
      document.getElementById("hm-capacity-div").style.display = "block";
      document.getElementById("hm-removal-rate-div").style.display = "none";
    } else {
      document.getElementById("hm-removal-rate-div").style.display = "none";
      document.getElementById("hm-capacity-div").style.display = "none";
    }
  };

  const capSlider = document.getElementById("hm-capacity-slider");
  const capLabel = document.getElementById("hm-capacity");

  capLabel.innerHTML = capSlider.value;

  capSlider.oninput = function () {
    capacity = capSlider.value;
    capLabel.innerHTML = capSlider.value;
  };

  var controlContainer = document.getElementById("controlContainer");
  controlContainer.style.top =
    userlistBox.offsetTop + userlistBox.offsetHeight + 10 + "px";

    firebaseRef.child("users").once("value", function (data) {
      const urlUserColorLoc = window.location.href.search("hex");
      const urlUserColor = window.location.href.substring(urlUserColorLoc + 4, urlUserColorLoc + 11);
  
      if (urlUserColorLoc === -1 || urlUserColor === undefined || !isValidHexColor(urlUserColor)) {
          var existingColors = [];
          data.forEach(function(childSnapshot) {
              if (childSnapshot.key !== userId) {
                  existingColors.push(childSnapshot.val().color);
              }
          });
  
          var newUserColor = selectNewColorFromList(existingColors, firepad.firebaseAdapter_.color_);
          firepad.firebaseAdapter_.setColor(newUserColor);
          pickr.setColor(newUserColor);
      } else {
          if (isValidHexColor(urlUserColor)) {
              console.log("setting color to url color: " + urlUserColor);
              firepad.firebaseAdapter_.setColor(urlUserColor);
              pickr.setColor(urlUserColor);
          }
      }
  });
  function isValidHexColor(hex) {
    // Regular expression to check if the string is a valid hex color
    const regex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
    return regex.test(hex);
  }


  /**
   * Select a new color based on which order users came into the session.
   * User 1 will always be the first color, User 2 will always be the second
   * color, etc.
   * */
  function selectNewColorFromList(existingColors, currentColor) {
    const listOfColors = [
        "#0000FF", "#FF0000", "#008000", "#800080", "#FFA500", "#FF00FF", "#008080"
    ]; // blue, red, green, purple, orange, magenta, teal
    
    // Filter out colors that are already in use
    const availableColors = listOfColors.filter(color => 
        !existingColors.some(existing => existing.toLowerCase() === color.toLowerCase())
    );
    
    if (availableColors.length > 0) {
        // If there are available colors, return the first one
        return availableColors[0];
    } else {
        // If all colors are taken, fall back to the original color or generate a random one
        return currentColor || '#' + Math.floor(Math.random()*16777215).toString(16);
    }
}

  /**
   * selectNewColor selects a new color given the existing colors
   * by picking out the largest gap between among the existing colors
   * based on the HCL color space and returns the middle color in that gap.
   *
   * @param {*} existingColors
   * @param {*} currentColor
   * @returns a new color
   */
  function selectNewColor(existingColors, currentColor) {
    var numColors = existingColors.length;
    if (numColors == 0) {
      return currentColor;
    }

    existingColors.sort(function (a, b) {
      if (a[0] == b[0]) {
        return 0;
      } else {
        return a[0] < b[0] ? -1 : 1;
      }
    });

    var l = Math.max(Math.min(Math.random() * 100.0, 90.0), 30.0);
    var c = Math.max(Math.min(Math.random() * 100.0, 75.0), 25.0);

    var hue_min = 0;
    var hue_max = 0;

    for (var i = 1; i < numColors; i++) {
      var prev_hue = existingColors[i - 1][0];
      var curr_hue = existingColors[i][0];

      if (curr_hue - prev_hue > hue_max - hue_min) {
        hue_min = prev_hue;
        hue_max = curr_hue;
      }
      console.log(hue_min, hue_max);
    }

    var lst_hue = existingColors[numColors - 1][0];
    var fst_hue = existingColors[0][0] + 360;

    if (fst_hue - lst_hue > hue_max - hue_min) {
      hue_min = lst_hue;
      hue_max = fst_hue;
    }

    var h = (hue_min + (hue_max - hue_min) / 2) % 360;
    var newColor = chroma(h, c, l, "hcl").hex();

    return newColor;
  }

  return {
    userlistBoxOffsetWidth: userlistBox.offsetWidth,
  };
})();
