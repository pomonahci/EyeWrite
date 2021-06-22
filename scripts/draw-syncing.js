// var resetRevId = true;

var primSket;

var svgSYNC = true;//Responsible for initializing the svg on page startup
function synchronize(snapshot) {
  if (snapshot.val()) {
    console.log("Remote Update");
    primSket.loadSketch(snapshot.val());
    primSket.displayLoadedSketch(false);
  }
}

// Listens always for updates to the svg canvas
firebaseRef.child('svg').on('value', function (snapshot) {
  if (!editor) synchronize(snapshot);
  editor = false;
});


var editor = false;
function sketchEdit(e) {
  console.log("edit made: " + e);
  editor = true;
  if (e == 'draw' || e == 'move') primSket.currentPath.idCreator = userId;
  var srl = primSket.serialize()
  console.log(srl);
  firepad.firebaseAdapter_.ref_.child('svg').transaction(function (current) {
    return srl;
  })
}