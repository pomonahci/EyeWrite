/**
 * ui-adjustments.js handles some UI customization
 * 
 * Name: davecarroll, chanhakim, aidangarton
 * Date: Summer 2020
 */

var UIAdjustments = function () {
  firepadUserList.firebaseOff_(firebaseRef.child('users'), 'child_changed', firepadUserList['firebaseCallbacks_'][4]['callback']);

  var logo = document.getElementsByClassName('powered-by-firepad')[0];
  logo.parentNode.removeChild(logo);

  document.getElementsByClassName('firepad-userlist-name-hint')[0].style.top = '20px';

  var userlistBox = document.getElementsByClassName('firepad-userlist')[0];
  userlistBox.className += ' userlist-box';

  var userlist = document.getElementsByClassName('firepad-userlist-users')[0];
  userlist.style.height = (userlistBox.offsetHeight + userlistBox.offsetTop - userlist.offsetTop) + 'px';
  userlist.style.overflowY = 'scroll';

  var colorEditPencilIcon = document.createElement('img');
  colorEditPencilIcon.id = "color-edit-pencil-icon";
  colorEditPencilIcon.src = './graphics/pencil.png';

  var el = document.createElement('button');
  el.className = 'colorpicker-button';
  el.appendChild(colorEditPencilIcon);

  var colorPicker = document.createElement('div');
  colorPicker.appendChild(el);

  var thisUserColorIndicator = document.getElementsByClassName("firepad-user-" + userId)[0];
  thisUserColorIndicator.appendChild(colorPicker);

  const pickr = new Pickr(Object.assign({
    el,
    theme: 'nano',
    useAsButton: true,
    default: '#000000',
    swatches: null,
    defaultRepresentation: 'HEXA',
    components: {
      preview: true,
      opacity: false,
      hue: true,
      interaction: {
        hex: false,
        rgba: false,
        hsva: false,
        input: false,
        clear: false,
        save: true
      }
    }
  }));

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

  firebaseRef.child("users").child(userId).on("value", function (snapshot) {
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
  }

  var slider2 = document.getElementById("sentenceSlider2");
  var output2 = document.getElementById("numSentences2");
  output2.innerHTML = slider2.value;

  slider2.oninput = function () {
    var val = Math.floor((this.value/66) * 100);
    output2.innerHTML = (val + "%");
  }

  slider2.onload = function () {
    var val = Math.floor((this.value/66) * 100);
    output2.innerHTML = (val + "%");
  }

  // var slider3 = document.getElementById("hm-radius-slider");
  // var output3 = document.getElementById("hm-radius");
  // output3.innerHTML = slider3.value;

  // slider3.oninput = function () {
  //   output3.innerHTML = this.value;
  //   updateHeatmapStyle({
  //     container: document.querySelector('#heatmap'),
  //     radius: document.getElementById("hm-radius-slider").value,
  //     // opacity: document.getElementById("hm-opacity-slider").value / 100,
  //     blur: document.getElementById("hm-blur-slider").value / 100,
  //   })
  // }

  // var slider4 = document.getElementById("hm-opacity-slider");
  // var output4 = document.getElementById("hm-opacity");
  // output4.innerHTML = slider4.value + "%";

  // slider4.oninput = function () {
  //   output4.innerHTML = this.value + "%";
  //   updateHeatmapStyle({
  //     container: document.querySelector('#heatmap'),
  //     radius: document.getElementById("hm-radius-slider").value,
  //     // opacity: document.getElementById("hm-opacity-slider").value / 100,
  //     blur: document.getElementById("hm-blur-slider").value / 100,
  //   })
  // }

  // var slider5 = document.getElementById("hm-blur-slider");
  // var output5 = document.getElementById("hm-blur");
  // output5.innerHTML = slider5.value;

  // slider5.oninput = function () {
  //   output5.innerHTML = this.value;
  //   updateHeatmapStyle({
  //     container: document.querySelector('#heatmap'),
  //     radius: document.getElementById("hm-radius-slider").value,
  //     // opacity: document.getElementById("hm-opacity-slider").value / 100,
  //     blur: document.getElementById("hm-blur-slider").value / 100,
  //   })
  // }

  var controlContainer = document.getElementById('controlContainer');
  controlContainer.style.top = (userlistBox.offsetTop + userlistBox.offsetHeight + 10) + "px";

  firebaseRef.child('users').once("value", function (data) {
    // do some stuff once
    var existingColors = []
    if (data.key != userId) {
      for (let [uID, val] of Object.entries(data.val())) {
        if (uID != userId) {
          existingColors.push(chroma(val['color']).hcl());
          // if (window.debug) console.log(chroma(val['color']).hcl());
        }
      };
    }
    if (existingColors.length > 0) {
      firepad.firebaseAdapter_.setColor('#ffffff');
    }
    // console.log(existingColors, 'Now generate a new color for current user!');

    // Pick a new color for the user.
    var newUserColor = selectNewColor(existingColors, firepad.firebaseAdapter_.color_);
    firepad.firebaseAdapter_.setColor(newUserColor);

  });

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
    var newColor = chroma(h, c, l, 'hcl').hex();

    return newColor;
  }

  return {
    userlistBoxOffsetWidth: userlistBox.offsetWidth
  }
}();