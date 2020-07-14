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

  var el = document.createElement('button');
  el.className = 'colorpicker-button';
  el.innerText = 'Change Color';
  el.style.width = (userlistBox.offsetWidth - 20) + 'px';

  var colorPicker = document.getElementById('colorpicker');
  colorPicker.style.top = (userlistBox.offsetHeight + userlistBox.offsetTop + 15) + 'px';
  colorPicker.appendChild(el);

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
        clear: true,
        save: true
      }
    }
  })
  );

  document.getElementById('user-checkboxes-container').style.top = (colorPicker.offsetHeight + colorPicker.offsetTop + 10) + 'px';

  return {
    userlistBox: userlistBox,
    pickr: pickr
  }

}();