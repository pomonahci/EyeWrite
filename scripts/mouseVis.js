var FirepadCM; //reference for our firepad's instance of codemirror

var usersChecked = {}; //dictionary that keeps track of which users are checked to be visualized
var userColors = {}; //dictionary that holds user colors (to avoid unecessary reading from firebase)
var userHighlights = {}; //dictionary that associates each user with their mouse highlight (TextMarker object)

var mousePosRef = firebaseRef.child('mice'); //reference to the area of the database containing user mouse positions

firepad.on('ready', function () {
  if (firepad.isHistoryEmpty()) {
    firepad.setText('Welcome to EyeWrite'); //sets initial text
  }

  //bootstrap-multiselect is a github repo I included
  $('#user-checkboxes').multiselect({ //initializes checkbox dropdown for user visualization
    includeSelectAllOption: true,
    disableIfEmpty: true,
    buttonContainer: '<div class="dropdown-button" />', //for UI button positioning purposes
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

  //Firebase listener for when users are added
  firebaseRef.child('users').on('child_added', function (snapshot) {
    
    if (snapshot.key != userId) { //we don't add ourselves to the local dictionary because we don't visualize ourselves
      usersChecked[snapshot.key] = false; //initialize usersChecked entry as false
      userColors[snapshot.key] = snapshot.child('color').val(); //record this users color in the local dict

      
      if (snapshot.child('name').val() != null) { //if the name attribute in firebase has already loaded (it takes a second)
        $('#user-checkboxes').append('<option value=' + snapshot.key + '>' + snapshot.child('name').val() + '</option>'); //add this user to the checkbox list
        $('#user-checkboxes').multiselect('rebuild'); //rebuild checkbox list

      } else { 
        $('#user-checkboxes').append('<option value=' + snapshot.key + '>' + snapshot.key + '</option>'); //place holder to display userId when the name is not ready
        $('#user-checkboxes').multiselect('rebuild');

        //add a listener for when the name attribute in firebase is ready
        firebaseRef.child('users').child(snapshot.key).on('value', function (snapshot) {
          if (snapshot.child('name').val()) {
            $('option[value=' + snapshot.key + ']', $('#user-checkboxes'))[0]['label'] = snapshot.child('name').val(); //update the place holder entry
            $('#user-checkboxes').multiselect('rebuild');

            firebaseRef.child('users').child(snapshot.key).off('value'); //remove the listener
          }
        });
      }
    }
  });

  //Firebase listener for when usernames are changed
  //technically this tries to update the username whenever any data is changed under
  //users which is unnecessary but right now there is no nice way to listen for these individual events
  firebaseRef.child('users').on('child_changed', function (snapshot) {
    if (snapshot.key != userId) {
      if (snapshot.child('name').val()) {
        $('option[value=' + snapshot.key + ']', $('#user-checkboxes'))[0]['label'] = snapshot.child('name').val(); //update username in checkbox list
        $('#user-checkboxes').multiselect('rebuild');
      }
    }
  });

  //Firebase listener for when users are removed
  firebaseRef.child('users').on('child_removed', function (snapshot) {
    //remove their color from the local dict
    if (userColors[snapshot.key]) {
      delete userColors[snapshot.key];
    }
    //remove them from local usersChecked dict
    if (usersChecked[snapshot.key]) {
      delete usersChecked[snapshot.key];
    }
    //clear their highlight from the local dict and remove it
    if (userHighlights[snapshot.key]) {
      userHighlights[snapshot.key].clear();
      delete userHighlights[snapshot.key];
    }
    //remove them from the local checkbox list
    $('option[value=' + snapshot.key + ']', $('#user-checkboxes')).remove();
    $('#user-checkboxes').multiselect('rebuild');
  });

  //Firebase listener for mouse values, this callback is responsible for visualizing all users
  firebaseRef.child('mice').on('value', visualize);

  //DOM element as target to track mouse movements
  var textEl = document.getElementById('firepad'); //reference to the firepad html element

  //Mouse Event Listeners
  textEl.addEventListener('mousemove', function (event) {
    var mouse = FirepadCM.coordsChar({ left: event.clientX, top: event.clientY }, "window"); //transforms mouse coordinates to codemirror document position
    mousePosRef.child(userId).update({ line: mouse['line'], ch: mouse['ch'] }); //sends to firebase
  });

  textEl.addEventListener('mouseleave', function () {
    firebaseRef.child('mice').child(userId).update({ line: null, ch: null }); //send nulls to firebase to signal the user is off target but has not closed the window
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
        //finds the word (token) in the codemirror editor nearest to the position given
        let visToken = FirepadCM.getTokenAt({ line: line, ch: ch });

        //transforms the word into multi-sentence range
        let sentences = wordToLine(visToken, line);

        //default for if something goes wrong and sentences is null
        if (!sentences) {
          sentences['left'] = 0;
          sentences['right'] = 0;
        }

        //creates a highlight (TextMarker object) for the multi-sentence highlight range and uses the user's color
        let highlight = FirepadCM.markText(
          { line: line, ch: sentences['left'] },
          { line: line, ch: sentences['right'] },
          { css: "background: " + userColors[childSnapshot.key] });

        //associates this highlight with the user it came from in our local dictionary to keep track
        userHighlights[childSnapshot.key] = highlight;
      }
    }
  });
}

//takes a word (token) and a line and highlights the sentence that word
//is in, as well as the sentence before and the sentence after
function wordToLine(token, line) {

  //function for finding the token index in the array of tokens
  const isToken = (element) => element['start'] == token['start'] && element['end'] == token['end'];

  //array of all tokens from the given line
  let lineTokens = FirepadCM.getLineTokens(line);

  //the index found using the function isToken which checks if each element is the given token
  let index = lineTokens.findIndex(isToken);

  //left and right bumpers for finding periods and determining the highlight range
  let leftBump = index;
  let rightBump = index;

  //counters for the number of periods allowed on the left of the word and on the right of the word
  let leftPeriodCount = 2;
  let rightPeriodCount = 2;

  //loop until period conditions are satisfied
  while (true) {
    //ticks left
    if (lineTokens[leftBump]['start'] > 0 && leftPeriodCount > 0) {
      leftBump--;
    }
    //ticks right
    if (lineTokens[rightBump]['end'] < lineTokens[lineTokens.length - 1]['end'] && rightPeriodCount > 0) {
      rightBump++;
    }
    //counts down periods on the left
    if (lineTokens[leftBump]['string'].includes('.')) {
      leftPeriodCount--;
    }
    //counts down periods on the right
    if (lineTokens[rightBump]['string'].includes('.')) {
      rightPeriodCount--;
    }
    //if the period conditions are satisfied or we're up against the begining of the line or the end of the line then break
    if((leftPeriodCount <= 0 || lineTokens[leftBump]['start'] == 0) && (rightPeriodCount <= 0 || lineTokens[rightBump]['end'] == lineTokens[lineTokens.length - 1]['end'])){
      break;
    }
  }
  //Just because the highlighting of the starting period on the left is annoying, but if
  //we're at the begining of the line, the first character shouldn't be left out of the highlight
  if (lineTokens[leftBump]['start'] == 0) {
    return { left: lineTokens[leftBump]['start'], right: lineTokens[rightBump]['end'] };
  } else {
    return { left: lineTokens[leftBump]['start'] + 1, right: lineTokens[rightBump]['end'] };
  }
}

//when this user closes their window, removes them from the database and removes their mouse
window.onbeforeunload = async function () {
  await firebaseRef.child('mice').child(userId).remove();
  await firebaseRef.child('users').child(userId).remove();
}
