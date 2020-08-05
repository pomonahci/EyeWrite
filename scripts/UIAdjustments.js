var UIAdjustments = function () {
  firepadUserList.firebaseOff_(firebaseRef.child('users'), 'child_changed', firepadUserList['firebaseCallbacks_'][4]['callback']);

  var logo = document.getElementsByClassName('powered-by-firepad')[0];
  logo.parentNode.removeChild(logo);

  document.getElementsByClassName('firepad-userlist-name-hint')[0].style.top = 20 + 'px';

  var userlistBox = document.getElementsByClassName('firepad-userlist')[0];
  userlistBox.className += ' userlist-box';

  var userlist = document.getElementsByClassName('firepad-userlist-users')[0];
  userlist.style.height = (userlistBox.offsetHeight + userlistBox.offsetTop - userlist.offsetTop) + 'px';;
  userlist.style.overflowY = 'scroll';


  var thisUserColorIndicator = document.getElementsByClassName("firepad-user-" + userId)[0];

  var el = document.createElement('button');
  el.className = 'colorpicker-button';

  var colorWheelPic = document.createElement('img');
  colorWheelPic.src = 'colorwheel.png';
  colorWheelPic.style.position = "relative";
  colorWheelPic.style.left = "-5px";
  
  colorWheelPic.style.height = "30px";
  colorWheelPic.style.width = "30px";
  
  
  el.appendChild(colorWheelPic);
  
  var colorPicker = document.getElementById('colorpicker');
  colorPicker.style.position = "absolute";
  colorPicker.style.top = 0 + "px";
  
  colorPicker.appendChild(el);
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

  var userCheckboxesContainer = document.getElementById('user-checkboxes-container');
  userCheckboxesContainer.style.top = (userlistBox.offsetTop + userlistBox.offsetHeight + 10) + "px";

  var transmitToggleButtons = document.getElementsByClassName('transmit-toggle-buttons')[0];
  transmitToggleButtons.style.top = (userCheckboxesContainer.offsetTop + userCheckboxesContainer.offsetHeight + 60) + "px";

  var mouseGazeButtons = document.getElementsByClassName('mouse-gaze-buttons')[0];
  mouseGazeButtons.style.top = (userCheckboxesContainer.offsetTop + userCheckboxesContainer.offsetHeight + 80)+ "px";

  var sliderContainer = document.getElementsByClassName('slider-container')[0];
  sliderContainer.style.top = (userCheckboxesContainer.offsetTop + userCheckboxesContainer.offsetHeight + 100)+ "px";

  return {
    userlistBox: userlistBox,
    pickr: pickr
  }
}();