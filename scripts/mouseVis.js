var FirepadCM = null;

var userColors = {};
var userHighlights = {};

var mousePosRef = firepadRef.child('mice');

window.gazeOn = false;
var toggleButton = document.getElementById('toggleButton');

//// Initialize contents.
firepad.on('ready', function () {
  if (firepad.isHistoryEmpty()) {
    firepad.setText('Welcome to EyeWrite');
  }

  //Once firepad is ready, we grab the CodeMirror editor instance from within firepad
  FirepadCM = firepad.editorAdapter_.cm;


  var textEl = document.getElementById('firepad');

  //Mouse Event Listeners
  textEl.addEventListener('mousemove', function (event) {
    var mouse = FirepadCM.coordsChar({ left: event.clientX, top: event.clientY }, "window");
    mousePosRef.child(userId).update({ line: mouse['line'], ch: mouse['ch'] });
  });

  textEl.addEventListener('mouseleave', function () {
    userHighlights[userId].clear();
    firepadRef.child('mice').child(userId).update({ line: null, ch: null });
  });

  changeGaze();
});

function visualize(snapshot) {

  snapshot.forEach(function (childSnapshot) {

    let line = childSnapshot.child('line').val();
    let ch = childSnapshot.child('ch').val();

    if (line !== null && ch !== null) {

      let visWord = FirepadCM.findWordAt({ line: line, ch: ch });

      if (userHighlights[childSnapshot.key]) {
        userHighlights[childSnapshot.key].clear();
      }

      let highlight = FirepadCM.markText(
        { line: visWord['anchor']['line'], ch: visWord['anchor']['ch'] },
        { line: visWord['head']['line'], ch: visWord['head']['ch'] },
        { className: "highlight", css: "background: " + userColors[childSnapshot.key] });

      userHighlights[childSnapshot.key] = highlight;
    }
  });
}


document.addEventListener('keyup', function (e) {
  // user can toggle between gaze on and off with esc key
  if (e.keyCode == 27) {
    changeGaze();
  }
});

function changeGaze() {
  gazeOn = !gazeOn;
  if (gazeOn) {
    toggleButton.innerHTML = "Hide Gaze (ESC)";
    toggleButton.style.backgroundColor = "#AF3131";
    firepadRef.child('mice').on('value', visualize);
  } else {
    toggleButton.innerHTML = "Show Gaze (ESC)";
    toggleButton.style.backgroundColor = "#3BA057";
    firepadRef.child('mice').off('value', visualize);
    for (user in userHighlights) {
      userHighlights[user].clear();
    }
  }
}

window.onbeforeunload = async function () {
  userHighlights[userId].clear();
  await firepadRef.child('mice').child(userId).remove();
  await firepadRef.child('users').child(userId).remove();
  console.log('done');
}


firepadRef.child('users').on('child_added', function (snapshot) {
  console.log(snapshot.key);
  userColors[snapshot.key] = snapshot.child('color').val();
});

firepadRef.child('users').on('child_removed', function (snapshot) {
  delete userColors[snapshot.key];
  userHighlights[snapshot.key].clear();
  delete userHighlights[snapshot.key];
});