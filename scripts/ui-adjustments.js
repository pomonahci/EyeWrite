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

  return {
    userlistBoxOffsetWidth: userlistBox.offsetWidth
  }
}();