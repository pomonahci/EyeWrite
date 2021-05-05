/**
 * ui-adjustments.js handles some UI customization
 * 
 * Name: Dave
 * Date: n/a
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
    console.log(existingColors, 'Now generate a new color for current user!');

    var newUserColor = select_new_color(existingColors, firepad.firebaseAdapter_.color_);
    console.log(newUserColor, chroma(newUserColor).hcl());
    firepad.firebaseAdapter_.setColor(newUserColor);

  });

  function select_new_color(existingColors, currentColor) {
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

    // console.log(existingColors);

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