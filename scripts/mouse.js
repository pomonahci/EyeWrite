var firepad = firepad || {};

var FirepadMouse = (function() {

    

    firepad.Mouse = (function () {
        'use strict';

        function Mouse(x, y) {
            this.x = x;
            this.y = y;
        }

        Mouse.fromJSON = function (obj) {
            return new Mouse(obj.x, obj.y);
        };

        Mouse.prototype.equals = function (other) {
            return this.x === other.x &&
                this.y === other.y;
        };

        return Mouse;

    }());

    firepad.utils.makeEventEmitter(firepad.FirebaseAdapter, ['mouse']);

    firepad.FirebaseAdapter.prototype.dispose_mouse_ = function () {
        if (!this.ready_) {

            // TODO: this completes loading the text even though we're no longer interested in it.
            this.on('ready', function () { this.dispose_mouse_(); });
            return;
        }
        if (this.userRef_) {

            this.userRef_.child('mouse').remove();
        }
    };

    firepad.FirebaseAdapter.prototype.sendMouse = function (obj) {
        this.userRef_.child('mouse').set(obj);
        this.mouse_ = obj;
    };

    firepad.FirebaseAdapter.prototype.initializeUserData_mouse_ = function () {

        this.userRef_.child('mouse').onDisconnect().remove();
        this.sendMouse(this.mouse_ || null);
    };

    firepad.FirebaseAdapter.prototype.monitorMice_ = function () {
        var usersRef = this.ref_.child('users');
        var self = this;

        function childChanged(childSnap) {
            var userId = childSnap.key;
            var userData = childSnap.val();
            self.trigger('mouse', userId, userData.mouse, userData.color);
        }

        this.firebaseOn_(usersRef, 'child_added', childChanged);
        this.firebaseOn_(usersRef, 'child_changed', childChanged);

        this.firebaseOn_(usersRef, 'child_removed', function (childSnap) {
            var userId = childSnap.key;
            self.trigger('mouse', userId, null);
        });
    };

    firepad.EditorClient.OtherClient.prototype.updateMouse = function (mouse) {
        this.removeMouse();
        this.mouse = mouse;
        this.mouseMark = this.editorAdapter.setOtherMouse(
            mouse,
            this.color,
            this.id
        );
    };

    firepad.EditorClient.OtherClient.prototype.removeMouse = function () {
        if (this.mouseMark) { this.mouseMark.clear(); }
    };

    firepad.EditorClient.editorAdapter.registerCallbacks({
        mouseActivity: function (x, y) { self.onMouseActivity(x, y); }
    });

    firepad.EditorClient.serverAdapter.registerCallbacks({
        mouse: function (clientId, mouse, color) {
            if (self.serverAdapter.userId_ === clientId ||
                !(self.state instanceof Client.Synchronized)) {
                return;
            }
            var client = self.getClientObject(clientId);
            if (mouse) {
                if (color) client.setColor(color);
                client.updateMouse(Mouse.fromJSON(mouse));
            } else {
                client.removeMouse();
            }
        }
    });

    firepad.EditorClient.prototype.updateMouse = function (x, y) {
        this.mouse = this.editorAdapter.getMouse(x, y);
    };

    firepad.EditorClient.prototype.onMouseActivity = function (x, y) {
        var oldMouse = this.mouse;
        this.updateMouse(x, y);
        this.focused = true;
        if (!this.focused || oldMouse && this.mouse.equals(oldMouse)) { return; }
        this.sendMouse(this.mouse);
    };

    firepad.EditorClient.prototype.sendMouse = function (mouse) {
        if (this.state instanceof Client.AwaitingWithBuffer) { return; }
        this.serverAdapter.sendMouse(mouse);
    };

    bind(firepad.RichTextCodeMirror, 'onMouseActivity_');

    firepad.RichTextCodeMirror.codeMirror.on('mouseActivity', this.onMouseActivity_);

    firepad.utils.makeEventEmitter(RichTextCodeMirror, ['mouseActivity']);

    firepad.RichTextCodeMirror.prototype.detach_mouse = function () {

        firepad.RichTextCodeMirror.codeMirror.off('mouseActivity', this.onMouseActivity_);
        firepad.RichTextCodeMirror.clearAnnotations_();
    };

    firepad.RichTextCodeMirror.prototype.onMouseActivity_ = function () {
        console.log("moving");
    };

    bind(firepad.RichTextCodeMirrorAdapter, 'onMouseActivity');

    firepad.RichTextCodeMirrorAdapter.rtcm.on('mouseActivity', firepad.RichTextCodeMirrorAdapter.onMouseActivity);

    firepad.RichTextCodeMirrorAdapter.prototype.detach_mouse = function () {
        firepad.RichTextCodeMirrorAdapter.rtcm.off('mouseActivity', this.onMouseActivity);
    };

    firepad.RichTextCodeMirrorAdapter.prototype.onMouseActivity = function () {
        console.log("moving");
        self.trigger('mouseActivity');
    }

    firepad.RichTextCodeMirrorAdapter.prototype.getMouse = function (x, y) {
        return new Mouse(x, y);
    }

    firepad.RichTextCodeMirrorAdapter.prototype.setOtherMouse = function (mouse, color, clientId) {
        // show mouse
        var mouseX = mouse.x;
        var mouseY = mouse.y;
        var mouseEl = document.createElement('div');
        var canvas = document.getElementById('canvas');
        mouseEl.className = 'other-client';
        mouseEl.style.borderWidth = '2px';
        mouseEl.style.borderStyle = 'solid';
        mouseEl.style.borderColor = color;
        // send to canvas?
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = color;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(mouseX, mouseY, 5, 5);
    }

    firepad.Firepad.firebaseAdapter_.on('mouse', function () {
        self.trigger.apply(self, ['mouse'].concat([].slice.call(arguments)));
    });

    return FirepadMouse

})();











document.addEventListener('gazeData', function (e) {
    var x = e.detail.X;
    var y = e.detail.Y;
    var coords = {
        left: x,
        top: y
    }
    var onChar = true;
    var charLocation = rtcm.cm.coordsChar(coords);
    var charPosition = rtcm.cm.charCoords(charLocation);
    if (Math.abs(charPosition.left - x) > 20 || Math.abs(charPosition.top - y) > 100) {
        onChar = false;
    }

    const CodeMirrorElm = window.codeDiv;
    var toSend = charLocation;
    toSend['onChar'] = onChar;
    toSend['x'] = x;
    var scroll = document.getElementsByClassName('CodeMirror-scroll')[0].scrollTop;
    toSend['y'] = y + scroll;
    window.sendGaze(toSend);
    toSend['y'] = y;
    gazes[myUserId]['circle'] = toSend;
    setGazes(CodeMirrorElm);
});



window.onbeforeunload = function () {
    dataObj = {};
    dataObj.type = "userExited";
    dataObj.userId = myUserId;
    logData(dataObj);
}

var logData = function (dataObj) {
    var currentTime = (new Date).getTime();
    dataObj.epoch = currentTime + 47000;
    console.log(dataObj);
    var xhr = new XMLHttpRequest();
    var url = "/log";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {//Call a function when the state changes.
        if (xhr.readyState == 4 && xhr.status == 200) {
            alert(xhr.responseText);
        }
    }
    var data = JSON.stringify(dataObj);
    xhr.send(data);
};
