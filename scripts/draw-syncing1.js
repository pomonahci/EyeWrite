/**
 * draw-syncing.js controls server interaction of SVG canvas
 * Uses firebase as the server
 * 
 * Name: nickmarsano
 * Date: 07/6/2021
 */


var primSket;//refernce to svg sketchpage
var currentlyEditing = false;//used in original draw-syncing
// var ServerSketch;//json format of primSket kept on the firebase//used in original draw-syncing
var edit = 0;
// var ecThis; //used in original draw-syncing
var todos = [];
var pathEX;
// var collaborators;


function synchronize(sketch) {
  primSket.undoIndex = 0;
  primSket.clearUndoIndex = 0;
  primSket.loadSketch(sketch);
  primSket.displayLoadedSketch(false);

}

function completeTodos() {
  var cereal = primSket.serialize();
  for (const x of todos) {
    if (x.created == 'draw') {
      primSket.currentPath = pathEX.deserialize(x, primSket.draw, primSket.pencilTexture);;
      primSket.finishPath();
      primSket.currStrokeID += 1;
    }
    else {
      cereal.push(x);
      synchronize(cereal);
    }
  }
  todos = [];
}

firebaseRef.child('svg').child(userId).set("");

// Listens always for updates to the svg canvas
firebaseRef.child('svg').on('child_changed', function (snapshot) {
  if (!snapshot.val()) return;
  if (snapshot.key == userId || snapshot.val() == "") return;
  if (typeof (snapshot.val()) == 'string') {
    let splits = snapshot.val().split(':');
    if (splits[0] == 'erase') {
      let x = splits[1];
      let y = splits[2];
      primSket.erase(x, y);
    }
    else if (splits[0] == 'clear') {
      if (primSket.clear()) primSket.updateDimensions();
    }
    else if (splits[0] == 'undo') {
      let targetPath = 0;
      for (let i = primSket.getPaths().length - 1; i > -1; i--) {
        if (!primSket.getPaths()[i].undone && snapshot.key == primSket.getPaths()[i].idCreator) {
          targetPath = primSket.getPaths()[i];
          targetPath.undone = true;
          break;
        }
      }
      if (targetPath === 0) {
        if (primSket.clearedSketches.length < 2) return;
        else {
          primSket.undo();
          primSket.clearedSketches.pop();
          primSket.clearUndoIndex--;
        }
      }
      primSket.undo(targetPath);
    }
    else if (splits[0] == 'redo') {
      let targetPath = 0;
      for (let i = 0; i < primSket.getPaths().length; i++) {
        if (primSket.getPaths()[i].undone && snapshot.key == primSket.getPaths()[i].idCreator) {
          targetPath = primSket.getPaths()[i];
          targetPath.undone = false;
          break;
        }
      }
      if (targetPath === 0) {
        if (primSket.clearUndoIndex > 0) primSket.redo();
        else return;
      }
      primSket.redo(targetPath);
    }
    else if (splits[0] == 'color') {
      let x = splits[1];
      let y = splits[2];
      let c = splits[3];
      primSket.color(x, y, c);
    }
  }
  else {//handle move and draw

    if (snapshot.val().created == 'draw') {//draw
      var stroke = pathEX.deserialize(snapshot.val(), primSket.draw, primSket.pencilTexture);

      let paths = primSket.getPaths().slice(0, primSket.getPaths().length - primSket.undoIndex)
      primSket.updatePaths(paths, stroke)
      stroke.addToGroupSmoothed(primSket.sketchGroup)
      primSket.currStrokeID += 1;

    }
    else {//move
      // primSket.startMove({clientX:snapshot.val().xcof,clientY:snapshot.val().ycof,type:'move'});
      // primSket.continueLineWithEvent(null,'move',snapshot.val().xcot,snapshot.val().ycot);

      let selected = primSket.select(snapshot.val().xcof, snapshot.val().ycof)
      // makes (unrendered) copy of target path for future undo and adds to stack 
      let paths = selected[0]
      let targetPath = selected[1]
      let newTargetPath
      newTargetPath = pathEX.deserialize(targetPath.serialize(), primSket.draw, primSket.pencilTexture)
      newTargetPath.addToGroupSmoothed(primSket.sketchGroup) // necessary, otherwise copied path off position
      newTargetPath.timeStart = primSket.getTime()
      newTargetPath.idStroke = primSket.currStrokeID
      newTargetPath.pencilTextureToggle = targetPath.pencilTextureToggle
      newTargetPath.created = 2
      newTargetPath.idMovedFrom = targetPath.idStroke
      newTargetPath.movedFrom = targetPath
      targetPath.remove(3)
      primSket.currStrokeID += 1
      newTargetPath.opacity = 0.1
      newTargetPath.highlight()
      primSket.updatePaths(paths, newTargetPath)
      // this.currentPath = newTargetPath
      let rect = primSket.svg.getBoundingClientRect()
      let x
      let y
      let transform = primSket.sketchGroup.transform()
      // Transform coordinates on svg div to center origin coordinates of sketchGroup
      x = ((snapshot.val().xcot - rect.left) - transform.x) / transform.scaleX
      y = ((snapshot.val().xcoy - rect.top) - transform.y) / transform.scaleY
      newTargetPath.moveBy(x - primSket.currMouseLocation[0], y - primSket.currMouseLocation[1])
      primSket.currMouseLocation = [x, y]

      var p = primSket.getPaths();
      p[p.length - 1].opacity = 1;
      p[p.length - 1].highlight()

      return;




      var cereal = primSket.serialize();
      if (snapshot.val().created == 'move') {
        var moved = cereal.find(el => el.idStroke == snapshot.val().idMovedFrom)
        var ind = cereal.indexOf(moved);
        primSket.clearedSketches[0][ind].remove(3)
        cereal = primSket.serialize();
      }
      snapshot.val().idStroke = primSket.currStrokeID;//may not be doing anything whoops
      if (currentlyEditing) {
        todos.push(snapshot.val());
      }
      else {
        cereal.push(snapshot.val());
        synchronize(cereal);
      }
      primSket.currStrokeID += 1;
    }
  }


});
var xcof;
var ycof;
function sketchEdit(e, x, y, c) {
  if (e == 'point') {
    console.log('point');
    return;
  }

  if (e == 'store') {
    xcof = x.clientX;
    ycof = x.clientY;
    return
  }

  firepad.firebaseAdapter_.ref_.child('svg').child(userId).transaction(function (current) {
    if (e == 'draw') {
      primSket.currentPath.created = e;
      primSket.currentPath.idStroke = primSket.currentPath.idStroke + userId
      primSket.currentPath.idCreator = userId;

      // var test = primSket.currentPath.serialize();
      // var test2 = pathEX.deserialize(test, primSket.draw, primSket.pencilTexture);

      return primSket.currentPath.serialize();
    }
    else if (e == 'move') {
      primSket.currentPath.created = e;
      primSket.currentPath.idCreator = userId;
      var toBeRet = primSket.currentPath.serialize();
      toBeRet.xcof = xcof;
      toBeRet.ycof = ycof;
      toBeRet.xcot = x;
      toBeRet.ycot = y;
      return toBeRet;
    }
    else if (e == 'erase') {
      return 'erase:' + x + ':' + y + ':' + edit++;
    }
    else if (e == 'clear') {
      return 'clear' + ':' + edit++;
    }
    else if (e == 'color') {
      return 'color:' + x + ':' + y + ':' + c + ':' + edit++;
    }
    else if (e == 'undo') {
      let targetPath = 0;
      for (let i = primSket.getPaths().length - 1; i > -1; i--) {
        if (!primSket.getPaths()[i].undone && userId == primSket.getPaths()[i].idCreator) {
          targetPath = primSket.getPaths()[i];
          targetPath.undone = true;
          break;
        }
      }
      if (targetPath === 0) {
        if (primSket.clearedSketches.length < 2) return "";
        else {
          primSket.undo();
          primSket.clearedSketches.pop();
          primSket.clearUndoIndex--;
        }
      }
      primSket.undo(targetPath);
      return 'undo' + ':' + edit++;
    }
    else if (e == 'redo') {
      let targetPath = 0;
      for (let i = 0; i < primSket.getPaths().length; i++) {
        if (primSket.getPaths()[i].undone && userId == primSket.getPaths()[i].idCreator) {
          targetPath = primSket.getPaths()[i];
          targetPath.undone = false;
          break;
        }
      }
      if (targetPath === 0) {
        if (primSket.clearUndoIndex > 0) primSket.redo();
        else return;
      }
      primSket.redo(targetPath);
      return 'redo' + ':' + edit++;
    }
    return "";
  })
  completeTodos();
  currentlyEditing = false;
}