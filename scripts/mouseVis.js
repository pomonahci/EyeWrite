var FirepadCM; //reference for our firepad's instance of codemirror

var usersChecked = {}; //dictionary that keeps track of which users are checked to be visualized
var userColors = {}; //dictionary that holds user colors (to avoid unecessary reading from firebase)
var userHighlights = {}; //dictionary that associates each user with their mouse highlight (TextMarker object)

var mousePosRef = firebaseRef.child('mice'); //reference to the area of the database containing user mouse positions

firepad.on('ready', function () {
  if (firepad.isHistoryEmpty()) {
    firepad.setText('Welcome to EyeWrite'); //sets initial text
  }

  $('#user-checkboxes').multiselect({ //initializes checkbox dropdown for user visualization
    includeSelectAllOption: true,
    disableIfEmpty: true,
    buttonContainer: '<div class="dropdown-button" />', //for positioning purposes
    buttonText: function () {
      return 'Select users to visualize';
    },
    onChange: function (option, checked, select) { //updates local dictionaries if a checked value changes
      usersChecked[option.val()] = checked;
      if (userHighlights[option.val()]) {
        userHighlights[option.val()].clear();
      }
    },
    onSelectAll: function () { //separate callback for select all
      for (key in usersChecked) {
        usersChecked[key] = true;
        if (userHighlights[key]) {
          userHighlights[key].clear();
        }
      }
    },
    onDeselectAll: function () { //separate callback for deselect all
      for (key in usersChecked) {
        usersChecked[key] = false;
        if (userHighlights[key]) {
          userHighlights[key].clear();
        }
      }
    }
  });

  FirepadCM = firepad.editorAdapter_.cm; //we grab the codemirror instance from firepad now that firepad is ready

  firebaseRef.child('users').on('child_added', function (snapshot) {

    if (snapshot.key != userId) {
      usersChecked[snapshot.key] = false;
      userColors[snapshot.key] = snapshot.child('color').val();

      if (snapshot.child('name').val() != null) {
        $('#user-checkboxes').append('<option value=' + snapshot.key + '>' + snapshot.child('name').val() + '</option>');
        $('#user-checkboxes').multiselect('rebuild');

      } else {
        $('#user-checkboxes').append('<option value=' + snapshot.key + '>' + snapshot.key + '</option>');
        $('#user-checkboxes').multiselect('rebuild');

        firebaseRef.child('users').child(snapshot.key).on('value', function (snapshot) {
          if (snapshot.child('name').val()) {
            $('option[value=' + snapshot.key + ']', $('#user-checkboxes'))[0]['label'] = snapshot.child('name').val();
            $('#user-checkboxes').multiselect('rebuild');

            firebaseRef.child('users').child(snapshot.key).off('value');
          }
        });
      }
    }
  });

  firebaseRef.child('users').on('child_changed', function (snapshot) {
    if (snapshot.key != userId) {
      if (snapshot.child('name').val()) {
        $('option[value=' + snapshot.key + ']', $('#user-checkboxes'))[0]['label'] = snapshot.child('name').val();
        $('#user-checkboxes').multiselect('rebuild');
      }
    }
  });

  firebaseRef.child('users').on('child_removed', function (snapshot) {

    if (userColors[snapshot.key]) {
      delete userColors[snapshot.key];
    }
    if (usersChecked[snapshot.key]) {
      delete usersChecked[snapshot.key];
    }
    if (userHighlights[snapshot.key]) {
      userHighlights[snapshot.key].clear();
      delete userHighlights[snapshot.key];
    }

    $('option[value=' + snapshot.key + ']', $('#user-checkboxes')).remove();
    $('#user-checkboxes').multiselect('rebuild');

  });

  firebaseRef.child('mice').on('value', visualize);

  var textEl = document.getElementById('firepad'); //reference to the firepad html element

  //Mouse Event Listeners
  textEl.addEventListener('mousemove', function (event) {
    var mouse = FirepadCM.coordsChar({ left: event.clientX, top: event.clientY }, "window"); //transforms mouse coordinates to codemirror document position
    mousePosRef.child(userId).update({ line: mouse['line'], ch: mouse['ch'] }); //sends to firebase
  });

  textEl.addEventListener('mouseleave', function () {
    firebaseRef.child('mice').child(userId).update({ line: null, ch: null }); //delete the users highlight from firebase
  });
});

//callback function for visualization
function visualize(snapshot) {
  snapshot.forEach(function (childSnapshot) { //iterates through mice

    if (usersChecked[childSnapshot.key]) {
      //grabs position info
      let line = childSnapshot.child('line').val();
      let ch = childSnapshot.child('ch').val();

      //if there already exists a highlight for this user we clear it to make a new one
      if (userHighlights[childSnapshot.key]) { //childSnapshot.key is the userId
        userHighlights[childSnapshot.key].clear();
      }

      //incase we get passed nulls
      if (line != null && ch != null) {
        //finds the word in the codemirror instance nearest to the position given
        let visWord = FirepadCM.findWordAt({ line: line, ch: ch });

        //creates a highlight (TextMarker object) for that word and uses the user's color
        let highlight = FirepadCM.markText(
          { line: visWord['anchor']['line'], ch: visWord['anchor']['ch'] },
          { line: visWord['head']['line'], ch: visWord['head']['ch'] },
          { css: "background: " + userColors[childSnapshot.key] });

        //associates this highlight with the user it came from in our local dictionary to keep track
        userHighlights[childSnapshot.key] = highlight;
      }
    }
  });
}

//when this user closes their window, removes them from the database and removes their mouse
window.onbeforeunload = async function () {
  await firebaseRef.child('mice').child(userId).remove();
  await firebaseRef.child('users').child(userId).remove();
}