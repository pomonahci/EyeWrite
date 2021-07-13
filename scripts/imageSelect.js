/**
 * imageSelect.js controls the image search task
 * Interprets URL for image and targets, handles server interaction and target control
 * 
 * Name: nickmarsano
 * Date: 06/30/2021
 */

var imageContainer = document.getElementById('imageContainer');
var container = imageContainer.getBoundingClientRect();

var imageSrc = document.getElementById('imageSearch');
var rect = imageSrc.getBoundingClientRect();

//example URL: hci.pomona.edu/EyeWrite/eyewrite.html#1kitten012

var imageLabel; // number identify 0-9 for what image is being looked at
// listings of bounding boxes for each image
var index2Label = { '0': 'fday.jpg', '1':'christ.png', '2':'horse.jpg'} //dictionary linking imageLabel number to literal string for ease of reading

var christBoxes = {'candle.png': [924, 101, 32, 86], 'fish.png':[671, 68, 58, 93], 'sock.png': [1043, 308, 106, 110], 'cone.png':[845, 578, 109, 46], 'bell.png':[1033, 46, 59, 45], 'shoe.png':[1209, 303, 78, 35]};

var fdayBoxes = {'football.png': [657, 307, 41, 77], 'candle2.png': [1238, 563, 50, 133], 'cone2.png': [1153, 102, 82, 93], 'shovel.png': [1067, 507, 161, 58], 'rabbit.png': [643, 19, 69, 104], 'bone.png': [773, 88, 94, 82]};

var horseBoxes = {'tulip.png': [1080, 68, 102, 152], 'tack.png': [657, 389, 47, 46], 'ladder.png': [1230, 248, 48, 23], 'brush.png': [1268, 348, 22, 143], 'rug.png': [1143, 457, 65, 82], 'carrot.png': [894, 614, 45, 82]};

var boundArray = { 'fday.jpg':  fdayBoxes, 'christ.png':  christBoxes, 'horse.jpg':  horseBoxes};

var bounding; // list of targets for imageLabel taken from boundArray
var misclicks = 0; // number of misclicks while searching for target (will be made global)
var target; // current target that participatns are looking for
var targetHit = false; // boolean value to determine if a bounding box should be drawn locally (only draw once)
var numTargets = 3; // number of targets to find per image
var task = 0; // index of target, will incremenent
var numPpl; // number of participants in this experiement (gotten from URL)
var url; //apache url
var found = []; //found and skipped are arrays to make sure the server only gets pinged by one user when target is complete
var skipped = [];

function getImage() {
    var URL = window.location.href;
    imageLabel = URL.search("img");
    imageLabel = URL.substring(imageLabel + 4, imageLabel + 5);
    if (imageLabel == -1) return;
    numPpl = URL.search('par');
    if (numPpl == -1) {
        numPpl = 2;
    }
    else {
        numPpl = URL.substring(numPpl + 4, numPpl + 5);
    }
    var imageName = index2Label[imageLabel];
    bounding = boundArray[imageName];
    document.getElementById("imageSearch").src = "./graphics/" + imageName;
}


function getTarget() {
    firebaseRef.child('tasks').child(task).on('child_added', checkTaskComplete);//useless in experiments with more than 1 person
    firebaseRef.child('tasks').child(task).on('child_changed', checkTaskComplete);

    if (!bounding) return;
    var keys = Object.keys(bounding);
    numTargets = keys.length;

    target = bounding[keys[task]];
    document.getElementById("targetSearch").src = "./graphics/" + keys[task];
    console.log(keys[task]);
}

document.getElementById("imageSearch").addEventListener("click", onClick);
function onClick(event) {
    var x = event.clientX;
    var y = event.clientY;

    if (target[0] <= x && target[1] <= y && x <= target[0] + target[2] && y <= target[1] + target[3]) {
        if (!targetHit) {
            var box = document.createElement('div');
            var left = target[0] - container.left;
            var top = target[1] - container.top;
            var width = target[2];
            var height = target[3];
            var styleInput = 'position:absolute;border: 2px solid green;left:' + left + 'px;top:' + top + 'px;width:' + width + 'px;height:' + height + 'px';
            box.setAttribute('style', styleInput)
            box.setAttribute('id', 'foundTarget');
            document.querySelector("#imageContainer").append(box);
        }
        targetHit = true;
        // new Image().src = "https://hci.pomona.edu/TargetFoundBy" + userId;
        firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('targetClicked').transaction(function (current) {
            if (!current) current = [];
            var users = []
            for (const item of current) {
                users.push(item[0]);
            }
            if (!users.includes(userId)) current.push([userId, misclicks]);
            found.push(userId);
            return current
        })
    }
    else {
        // new Image().src = "https://hci.pomona.edu/TargetMissedBy" + userId;
        // apache.src = url;
        firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('incorrectClicks').transaction(function (current) {
            if(!current)current=0;
            current++;
            return current;
        })
        misclicks++;
    }
}

var action = '';
function checkTaskComplete(snapshot) {
    if (snapshot.val().length == numPpl) {
        if (snapshot.key == "skipVotes") {
            action = 'skip';
            // if (skipped[0] == userId) new Image().src = "https://hci.pomona.edu/TargetSkipped";
        }
        else {
            action = 'found'
            // if (found[0] == userId) new Image().src = "https://hci.pomona.edu/TargetFoundByAll";
        }

        nextTarget(action);
    }
}

function nextTarget(action) {
    clearBoxes();
    firebaseRef.child('tasks').child(task).off('child_added', checkTaskComplete);//useless in experiments with more than 1 person
    firebaseRef.child('tasks').child(task).off('child_changed', checkTaskComplete);

    task++;
    targetHit = false;
    if (numTargets == task) {
        console.log('Task Complete');
        // if (action == 'skip' && skipped[0] == userId) new Image().src = "https://hci.pomona.edu/All" + index2Label[imageLabel] + "TargetsComplete";
        // else if (action == 'found' && found[0] == userId) new Image().src = "https://hci.pomona.edu/All" + index2Label[imageLabel] + "TargetsComplete";
        document.getElementById("imageSearch").removeEventListener("click", onClick);
        document.getElementById('targetSearch').src = './graphics/targetbase.png';
        stopStopwatch();
        return;
    }
    action = '';
    skipped = [];
    found = [];
    getTarget();
}

function clearBoxes() {
    if (document.getElementById('foundTarget')) document.getElementById('foundTarget').remove();
}

function voteSkipTarget() {
    // new Image().src = "https://hci.pomona.edu/" + userId + "VotedToSkip";
    firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('skipVotes').transaction(function (current) {
        if (!current) current = [];
        if (!current.includes(userId)) current.push(userId);
        skipped.push(userId);
        return current
    })
}

function startExp() {
    getImage();
    getTarget();
}

//Used to get bounding box parameters manually and then inputting into "boundArray" dictionary above
var c1=true;
var x1;
var y1;
document.getElementById("imageSearch").addEventListener("click", whereAmI);
function whereAmI(event){
    if(c1)console.log("X: "+event.clientX+", Y: "+event.clientY);
    else console.log("Width: "+(event.clientX-x1)+", Height: "+(event.clientY-y1));
    x1 = event.clientX;
    y1 = event.clientY;
    c1=!c1;
}