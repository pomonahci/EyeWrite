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
var index2Label = { '0': 'kitten' } //dictionary linking imageLabel number to literal string for ease of reading
var boundArray = { 'kitten': { 'entireKitten': [rect.left, rect.top, 500, 500], 'topleft': [rect.left, rect.top, 100, 100] } };
var bounding; // list of targets for imageLabel taken from boundArray
var misclicks = 0; // number of misclicks while searching for target (will be made global)
var target; // current target that participatns are looking for
var targetHit = false; // boolean value to determine if a bounding box should be drawn locally (only draw once)
var numTargets = 3; // number of targets to find per image
var completed = 0; // number of users who found target
var task = 0; // index of target, will incremenent
var numPpl; // number of participants in this experiement (gotten from URL)
var taskComplete = false;
var skipVotes = 0;
var url; //apache url

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
    document.getElementById("imageSearch").src = "./graphics/" + imageName + '.jpg';
}

function getTarget() {
    firebaseRef.child('tasks').child(task).on('child_added', checkTaskComplete);//useless in experiments with more than 1 person
    firebaseRef.child('tasks').child(task).on('child_changed', checkTaskComplete);
    if (!bounding) return;
    var keys = Object.keys(bounding);
    numTargets = keys.length;

    target = bounding[keys[task]];
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
        url = "https://hci.pomona.edu/" + experiment + "/targetFoundBy" + userId;
        apache.src = url;
        firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('targetClicked').transaction(function (current) {
            if (!current) current = [];
            var users = []
            for (const item of current) {
                users.push(item[0]);
            }
            if (!users.includes(userId)) current.push([userId, misclicks]);
            completed = current.length;
            return current
        })

        // if (taskComplete) {
        //     taskComplete = false;
        //     nextTarget();
        // }
    }
    else {
        url = "https://hci.pomona.edu/" + experiment + "/targetMissedBy" + userId;
        apache.src = url;
        misclicks++;
    }
}


function checkTaskComplete(snapshot) {
    if (snapshot.val().length == numPpl) {
        url = "https://hci.pomona.edu/" + experiment + "/targetFoundByAll";
        new Image().src
        // apache.src = url;
        nextTarget();
    }
}

function nextTarget() {
    clearBoxes();
    firebaseRef.child('tasks').child(task).off('child_added', checkTaskComplete);//useless in experiments with more than 1 person
    firebaseRef.child('tasks').child(task).off('child_changed', checkTaskComplete);
    task++;
    targetHit = false;
    if (numTargets == task) {
        console.log('All Tasks Complete');
        alert("all targets found");
        document.getElementById("imageSearch").removeEventListener("click", onClick);
        return;
    }
    getTarget();
}

function clearBoxes() {
    document.getElementById('foundTarget').remove();
}

function voteSkipTarget() {
    firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('skipVotes').transaction(function (current) {
        if (!current) current = [];
        if (!current.includes(userId)) current.push(userId);
        skipVotes = current.length;
        return current
    })
}
if (skipVotes == numPpl) {
    nextTarget();
}

function startExp() {
    getImage();
    getTarget();
}