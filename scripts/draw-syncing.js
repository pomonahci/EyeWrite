
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

// Listens always for updates to the svg canvas
firebaseRef.child('svg').on('value', function (snapshot) {
  if (snapshot.val()) {
    ServerSketch = snapshot.val()['canvas'];
    if (ServerSketch && lastServer) {
      if (ServerSketch.length == lastServer.length && ServerSketch[ServerSketch.length - 1].idCreator != lastServer[lastServer.length - 1].idCreator) {
        lastServer[lastServer.length - 1].idStroke++;
        ServerSketch.push(lastServer[lastServer.length - 1]);
        firepad.firebaseAdapter_.ref_.child('svg').child('canvas').transaction(function (current) { return ServerSketch; });
      }
    }
    lastServer = ServerSketch;
    if (!snapshot.val()['canvas']) ServerSketch = [];
    if (!currentlyEditing) {
      synchronize(ServerSketch.slice(ServerSketch[1], ServerSketch.length));
    }
  }
});

function sketchEdit(e) {


  firepad.firebaseAdapter_.ref_.child('svg').child('canvas').transaction(function (current) {
    //create a log to apache server
    // var save_url = "http://hci.pomona.edu/Drawing?" + "x=" + x + ";y=" + y;
    // var temp_image = new Image();
    // temp_image.src = save_url;
    if (!current) current = [0, 2];//index 0 is the undo counter, index 1 is the clear counter
    if (e == 'draw') {
      current[0] = 0;
      primSket.currentPath.created = e;
      var thisPath = current.find(el => el.idStroke == primSket.currentPath.idStroke);
      current[current.indexOf(thisPath)] = primSket.currentPath.serialize();
    }
    else if (e == 'move') {
      while (current[current.length - 1].undone) current.pop();
      current[0] = 0;
      primSket.currentPath.idStroke = current.length - 1;// + 1;
      primSket.currentPath.created = e;
      current.find(el => el.idStroke == primSket.currentPath.idMovedFrom).status = 3;
      current.push(primSket.currentPath.serialize());
    }
    else if (e == 'erase') {
      var o = current.find(el => el.idStroke == ecThis.idStroke);
      o.status = 2;
      var copy = JSON.parse(JSON.stringify(o));
      copy.created = 'erase';
      while (current[current.length - 1].undone) current.pop();
      current[0] = 0;
      current.push(copy);
    }
    else if (e == 'clear') {
      if (current.length > 2) {
        var toAdd = JSON.parse(JSON.stringify(current[2]));
        toAdd.status = 2;
        toAdd.created = e;
        toAdd.idCreator = userId;
        toAdd.idStroke = null;
        toAdd.coords = [];
        toAdd.idMovedFrom = 0;
        toAdd.color = current.length;
        current[1] = current.length;
        current.push(toAdd);
      }
    }
    else if (e == 'color') {
      current.find(el => el.idStroke == ecThis.idStroke).color = color;
    }
    else if (e == 'undo') {
      if (current[0] < current.length - 2) {
        var todo = current[current.length - current[0] - 1]
        todo.undone = 1;
        //undo erase
        if (todo.created == 'erase') {
          current.find(el => el.idStroke == todo.idStroke).status = 1;
        }
        //undo move
        else if (todo.created == 'move') {
          current.find(el => el.idStroke == todo.idMovedFrom).status = 1;
          todo.status = 3;
        }
        //undo clear
        else if (todo.created == 'clear') {
          var nextClear = current.slice(0,todo.color-1).reverse().find(el => el.created == todo.created);
          if (nextClear) {
            current[1] = current.indexOf(nextClear);
          }
          else{current[1]=2;}
        }
        //undo draw
        else {
          todo.status = 2;
        }
        current[0]++;
      }
    }
    else if (e == 'redo') {
      if (current[0] > 0) {
        var todo = current[current.length - current[0]];
        todo.undone = 0;
        //redo erase
        if (todo.created == 'erase') {
          current.find(el => el.idStroke == todo.idStroke).status = 2;
        }
        //redo move
        else if (todo.created == 'move') {
          current.find(el => el.idStroke == todo.idMovedFrom).status = 3;
          todo.status = 1;
        }
        //redo clear
        else if (todo.created == 'clear') {
          current[1] = current.indexOf(todo);
        }
        //redo draw
        else {
          todo.status = 1;
        }
        current[0]--;
      }
    }
    else if (e == 'point') {
      var thisPath = current.find(el => el.idStroke == primSket.currentPath.idStroke);
      if (thisPath && userId == primSket.currentPath.idCreator) {
        current[current.indexOf(thisPath)] = primSket.currentPath.serialize();
      }
      else {
        current[0] = 0;
        if (current.length > 2) while (current[current.length - 1].undone) current.pop();
        primSket.currentPath.idStroke = current.length - 1;// + 1;
        primSket.currentPath.idCreator = userId;
        primSket.currentPath.created = e;
        current.push(primSket.currentPath.serialize());
      }
    }
    return current;
  })
}