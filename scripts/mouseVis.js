var FirepadCM; //reference for our firepad's instance of codemirror

var userColors = {}; //dictionary that holds cached user colors (to avoid unecessary reading from firebase)
var userHighlights = {}; //dictionary that associates each user with their mouse highlight (TextMarker object)

var mousePosRef = firebaseRef.child('mice'); //reference to the area of the database containing user mouse positions

window.gazeOn = false; //boolean storing if the visualization is on or off
var toggleButton = document.getElementById('toggleButton'); //reference to the toggle button html


firepad.on('ready', function () {
  if (firepad.isHistoryEmpty()) {
    firepad.setText('Welcome to EyeWrite'); //sets initial text
  }

  FirepadCM = firepad.editorAdapter_.cm; //we grab the codemirror instance from firepad now that firepad is ready

  var textEl = document.getElementById('firepad'); //reference to the firepad html element

  //Mouse Event Listeners
  textEl.addEventListener('mousemove', function (event) {
    var mouse = FirepadCM.coordsChar({ left: event.clientX, top: event.clientY }, "window"); //transforms mouse coordinates to codemirror document position
    mousePosRef.child(userId).update({ line: mouse['line'], ch: mouse['ch'] }); //sends to firebase
  });

  textEl.addEventListener('mouseleave', function () {
    userHighlights[userId].clear(); //clear this users highlight
    firebaseRef.child('mice').child(userId).update({ line: null, ch: null }); //delete the users highlight from firebase
  });

  changeGaze(); //callback function for the toggle switch -- we call it once here to add the visualization listener to firebase
});

//callback function for visualization
function visualize(snapshot) {

  snapshot.forEach(function (childSnapshot) { //iterates through mice

    //grabs position info
    let line = childSnapshot.child('line').val();
    let ch = childSnapshot.child('ch').val();

    //if there already exists a highlight for this user we clear it to make a new one
    if (userHighlights[childSnapshot.key]) { //childSnapshot.key is the userId
      userHighlights[childSnapshot.key].clear();
    }

    //incase we get passed nulls
    if (line !== null && ch !== null) {
      //finds the word in the codemirror instance nearest to the position given
      let visWord = FirepadCM.findWordAt({ line: line, ch: ch });
      let blahblah = userColors[childSnapshot.key];

      //creates a highlight (TextMarker object) for that word and uses the user's color
      let highlight = FirepadCM.markText(
        { line: visWord['anchor']['line'], ch: visWord['anchor']['ch'] },
        { line: visWord['head']['line'], ch: visWord['head']['ch'] },
        { css: "background: " + blahblah });
      
      //associates this highlight with the user it came from in our local dictionary to keep track
      userHighlights[childSnapshot.key] = highlight;
    }
  });
}



//adds the (esc) key as a shortcut for the visualization toggle button
document.addEventListener('keyup', function (e) {
  // user can toggle between gaze on and off with esc key
  if (e.keyCode == 27) {
    changeGaze();
  }
});

//callback for the visualization toggle button
function changeGaze() {
  gazeOn = !gazeOn; //flips the boolean
  if (gazeOn) {
    //sets text and color
    toggleButton.innerHTML = "Hide Gaze (ESC)";
    toggleButton.style.backgroundColor = "#AF3131";
    firebaseRef.child('mice').on('value', visualize);//adds the visualization listener to firebase
  } else {
    toggleButton.innerHTML = "Show Gaze (ESC)";
    toggleButton.style.backgroundColor = "#3BA057";
    firebaseRef.child('mice').off('value', visualize);//removes the visualization listener from firebase
    for (user in userHighlights) { //clears all highlights from being shown
      userHighlights[user].clear();
    }
  }
}

//when this user closes their window, removes them from the database and removes their mouse
window.onbeforeunload = async function () {
  await firebaseRef.child('mice').child(userId).remove();
  await firebaseRef.child('users').child(userId).remove();
}

//adds all user colors to our local dictionary
firebaseRef.child('users').on('child_added', function (snapshot) {
  userColors[snapshot.key] = snapshot.child('color').val();
});

//when users are removed from firebase, this removes thier color and highlight from our local dictionaries
firebaseRef.child('users').on('child_removed', function (snapshot) {
  delete userColors[snapshot.key];
  userHighlights[snapshot.key].clear();
  delete userHighlights[snapshot.key];
});