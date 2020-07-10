firepadUserList.firebaseOff_(firebaseRef.child('users'), 'child_changed', firepadUserList['firebaseCallbacks_'][4]['callback']);

// firepadUserList.firebaseOn_(firebaseRef.child('users'), 'child_changed', function update(userSnapshot) {

//   var userId = userSnapshot.key;

//   var userDiv = document.getElementsByClassName('firepad-user-' + userId)[0];
//   var userColorDiv = userDiv.getElementsByClassName('firepad-userlist-color-indicator')[0];
//   var userNameDiv = userDiv.getElementsByClassName('firepad-userlist-name')[0];


//   var name = userSnapshot.child('name').val();
//   if (typeof name !== 'string') { name = 'Guest'; }
//   name = name.substring(0, 20);

//   var color = userSnapshot.child('color').val();
//   if (!(typeof color === 'string' && (color.match(/^#[a-fA-F0-9]{3,6}$/) || color == 'transparent'))) {
//     color = "#ffb";
//   }

//   userColorDiv.style.backgroundColor = color;

//   if (userNameDiv) {
//     userNameDiv.innerText = name;
//   }


//   if (userId === firepadUserList.userId_) {
//     // HACK: We go ahead and insert ourself in the DOM, so we can easily order other users against it.
//     // But don't show it.
//     userDiv.style.display = 'none';
//   }

// });

var logo = document.getElementsByClassName('powered-by-firepad')[0];
logo.parentNode.removeChild(logo);

var nameHint = document.getElementsByClassName('firepad-userlist-name-hint')[0];
nameHint.style.top = 20 + 'px';

var userlistBox = document.getElementsByClassName('firepad-userlist')[0];
userlistBox.style.height = 200 + 'px';
userlistBox.style.borderRadius = 4 + 'px';

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
