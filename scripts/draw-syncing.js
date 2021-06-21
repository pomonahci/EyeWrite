

var resetRevId = true;
var chrs = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
function versionId(revision) {
  if(resetRevId && revision == 1) {firepad.firebaseAdapter_.revision_ = 0;resetRevId=false;revision=0;}
  if (revision === 0) {
    firepad.firebaseAdapter_.revision_++;
    return 'A0';
  }
  var str = '';
  while (revision > 0) {
    var digit = (revision % chrs.length);
    str = chrs[digit] + str;
    revision -= digit;
    revision /= chrs.length;
  }
  // Prefix with length (starting at 'A' for length 1) to ensure the id's sort lexicographically.
  var prefix = chrs[str.length + 9];
  firepad.firebaseAdapter_.revision_++;
  return prefix + str;
}

var primSket;
var currRev;

var svgSYNC = true;//Responsible for initializing the svg on page startup
function synchronize(snapshot){
  if(svgSYNC){
    console.log("Initializing");
    svgSYNC = false;
    firepad.firebaseAdapter_.revision_ = snapshot.val().o.length;
    currRev = snapshot.val().o.length;
    primSket.loadSketch(snapshot.val().o);
    primSket.displayLoadedSketch(false);
  }
  else if(userId != snapshot.val().a){
    console.log("Remote Update");
    console.log(firepad.firebaseAdapter_.revision_);
    primSket.loadSketch(snapshot.val().o);
    primSket.displayLoadedSketch(false);
  }
}

firebaseRef.child('svg').limitToLast(1).on('child_added', function(snapshot) {
  synchronize(snapshot);
});


function sketchEdit(e){
  svgSYNC = false;
  if(firepad.firebaseAdapter_.revision_ < currRev){
    firepad.firebaseAdapter_.revision_=currRev;
  }
  console.log("edit made");
  console.log(firepad.firebaseAdapter_.revision_);
  var ver = versionId(firepad.firebaseAdapter_.revision_);
  // console.log("version: "+ver);
  firepad.firebaseAdapter_.ref_.child('svg').child(ver).transaction(function(current) {
    if (current === null) {
      var entry = {a: userId, o:primSket.serialize(), t: firebase.database.ServerValue.TIMESTAMP};
      // console.log(entry);
      return entry;
    }
  })
}