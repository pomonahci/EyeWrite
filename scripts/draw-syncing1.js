/**
 * draw-syncing.js controls server interaction of SVG canvas
 * Uses firebase as the server
 * 
 * Name: nickmarsano
 * Date: 06/22/2021
 */


var primSket;//refernce to svg sketchpage
var currentlyEditing = false;
var ServerSketch;//json format of primSket kept on the firebase
var ecThis;
var color;
var lastServer = [];
var undo_index = 0;
var clear_index = 0;

function synchronize(sketch) {
  primSket.loadSketch(sketch);
  primSket.displayLoadedSketch(false);
}

firebaseRef.child('svg').child(userId).set("");
// ref.child(self.userId_).child('name');
// nameRef.onDisconnect().remove();
// nameRef.set(self.displayName_);

// Listens always for updates to the svg canvas
firebaseRef.child('svg').on('child_changed', function (snapshot) {
  if (!snapshot.val()) return;
  if (Object.keys(snapshot.val())[0] == userId) return;
  if (typeof (snapshot.val()[Object.keys(snapshot.val())[0]]) == 'string') {
    let splits = snapshot.val()[Object.keys(snapshot.val())[0]].split(':');
    if (splits[0] == 'erase') {
      let x = splits[1];
      let y = splits[2];
      primSket.erase(x, y);
    }
    else if (splits[0] == 'clear') {
      if (primSket.clear()) primSket.updateDimensions();
    }
    else if (splits[0] == 'undoo') {
      primSket.undo();
    }
    else if (splits[0] == 'redoo') {
      primSket.redo();
    }
    else if (splits[0] == 'color') {
      let x = splits[1];
      let y = splits[2];
      let c = splits[3];
      primSket.color(x, y, c);
    }
  }
  else {//handle move and draw
    if (snapshot.val()[Object.keys(snapshot.val())[0]].created == 'draw') {
      // primSket.currentPath = snapshot.val()[Object.keys(snapshot.val())[0]].deserialize();
      // primSket.currStrokeID +=1;
      // primSket.finishPath();
      var cereal = primSket.serialize();
      snapshot.val()[Object.keys(snapshot.val())[0]],idStroke = primSket.currStrokeID;
      cereal.push(snapshot.val()[Object.keys(snapshot.val())[0]]);
      synchronize(cereal);
      primSket.currStrokeID +=1;
    }
    else {
  
    }
  }

});

function sketchEdit(e, x, y, c) {

  if (e == 'point') return;

  firepad.firebaseAdapter_.ref_.child('svg').child(userId).transaction(function (current) {
    if (e == 'draw') {
      primSket.currentPath.created = e;
      return primSket.currentPath.serialize();
    }
    else if (e == 'move') {
      primSket.currentPath.created = e;
      return primSket.currentPath.serialize();
    }
    else if (e == 'erase') {
      return 'erase:' + x + ':' + y;
    }
    else if (e == 'clear') {
      return 'clear'
    }
    else if (e == 'color') {
      return 'color:' + x + ':' + y + ':' + c;
    }
    else if (e == 'undo') {
      return 'undoo'
    }
    else if (e == 'redo') {
      return 'redoo'
    }
    // else if (e == 'point') {
    //   var thisPath = current.find(el => el.idStroke == primSket.currentPath.idStroke);
    //   if (thisPath && userId == primSket.currentPath.idCreator) {
    //     current[current.indexOf(thisPath)] = primSket.currentPath.serialize();
    //   }
    //   else {
    //     current[0] = 0;
    //     if (current.length > 2) while (current[current.length - 1].undone) current.pop();
    //     primSket.currentPath.idStroke = current.length - 1;// + 1;
    //     primSket.currentPath.idCreator = userId;
    //     primSket.currentPath.created = e;
    //     current.push(primSket.currentPath.serialize());
    //   }
    // }
    return "";
  })
}