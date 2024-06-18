/**
 * imageSelect.js controls the image search task
 * Interprets URL for image and targets, handles server interaction and target control
 * 
 * Name: nickmarsano
 * Date: 06/30/2021
 */

var imageContainer = document.getElementById('imageContainer');
var container = imageContainer.getBoundingClientRect();


var imageLabel; // number identify 0-9 for what image is being looked at
// listings of bounding boxes for each image
var index2Label = { '0': 'fday.jpg', '1': 'christ.png', '2': 'horse.jpg', '3': 'warmup.png', '4': 'halloween.jpeg', '5': 'memorial.jpeg'} //dictionary linking imageLabel number to literal string for ease of reading
// var index2Label = { '0': 'fdayboxes.jpg', '1': 'christboxes.png', '2': 'horseboxes.jpg' }

var images = ['21_present_1.jpg', '21_present_2.jpg', '21_present_3.jpg', '21_present_4.jpg', '21_present_5.jpg', '21_present_6.jpg', '21_present_7.jpg', '21_present_8.jpg', '21_present_9.jpg', '21_present_10.jpg', '21_present_11.jpg', '21_present_12.jpg',
    '21_absent_1.jpg', '21_absent_2.jpg', '21_absent_3.jpg', '21_absent_4.jpg', '21_absent_5.jpg', '21_absent_6.jpg', '21_absent_7.jpg', '21_absent_8.jpg', '21_absent_9.jpg', '21_absent_10.jpg', '21_absent_11.jpg', '21_absent_12.jpg',
    '35_present_1.jpg', '35_present_2.jpg', '35_present_3.jpg', '35_present_4.jpg', '35_present_5.jpg', '35_present_6.jpg', '35_present_7.jpg', '35_present_8.jpg', '35_present_9.jpg', '35_present_10.jpg', '35_present_11.jpg', '35_present_12.jpg',
    '35_absent_1.jpg', '35_absent_2.jpg', '35_absent_3.jpg', '35_absent_4.jpg', '35_absent_5.jpg', '35_absent_6.jpg', '35_absent_7.jpg', '35_absent_8.jpg', '35_absent_9.jpg', '35_absent_10.jpg', '35_absent_11.jpg', '35_absent_12.jpg'];


  const boundArray = [(160,30), (2360,30), (2360, 1270),(160,1270)]


var bounding; // list of targets for imageLabel taken from boundArray
var misclicks = 0; // number of misclicks while searching for target (will be made global)
var targetHit = false; // boolean value to determine if a bounding box should be drawn locally (only draw once)
var numTargets = images.length; // number of targets to find per image
var task = 0; // index of target, will incremenent
var numPpl; // number of participants in this experiement (gotten from URL)
var url; //apache url
var found = 0;
var skipped = 0;
var mySkipVote = false;
var trial = 0;

function getImage(trial) {
    var imageName = images[trial];
    // bounding = boundArray[imageName];
    console.log(imageName)
    document.getElementById("imageSearch").src = "./generateTrials/images/" + imageName;

    serverContent.push(["Participants", numPpl]);
    serverContent.push(["Image", imageName]);
}

// var keys;
// function getTarget() {
//     // firebaseRef.child('tasks').child(task).child('targetClicked').set("");
//     // firebaseRef.child('tasks').child(task).child('incorrectClicks').set("");
//     // firebaseRef.child('tasks').child(task).child('skipVotes').set("");

//     // firebaseRef.child('tasks').child(task).child('targetClicked').on('child_added', checkTaskComplete);//useless in experiments with more than 1 person
//     // firebaseRef.child('tasks').child(task).child('targetClicked').on('child_changed', checkTaskComplete);
//     // firebaseRef.child('tasks').child(task).child('incorrectClicks').on('child_changed', updateIncorrectClicks);
//     firebaseRef.child('tasks').child(task).on('child_added', firelist);
//     firebaseRef.child('tasks').child(task).on('child_changed', firelist);

//     if (!bounding) return;
//     keys = Object.keys(bounding);
//     console.log("keys",keys)
//     numTargets = keys.length;
//     console.log("task",task)
//     target = bounding[keys[task]];
//     document.getElementById("targetSearch").src = "./graphics/" + keys[task];
//     serverContent.push(["Target", keys[task], Date.now()]);

// }

document.getElementById("imageSearch").addEventListener("click", onClick);
function onClick(event) {
    if (mySkipVote) return;
    if (targetHit) return
    var x = event.clientX;
    var y = event.clientY;
    console.log("x:",x, "y:",y)
    console.log('target:',
        target[0] * window.innerWidth, 
        target[1] * window.innerHeight, 
        target[0] * window.innerWidth + target[2] * window.innerWidth, 
        target[1] * window.innerHeight + target[3] * window.innerHeight
    )
    var left = target[0] * window.innerWidth - container.left;
    var top = target[1] * window.innerHeight - container.top;
    var width = target[2] * window.innerWidth;
    var height = target[3] * window.innerHeight;

    
    if (target[0] * window.innerWidth <= x && target[1] * window.innerHeight <= y && x <= target[0] * window.innerWidth + target[2] * window.innerWidth && y <= target[1] * window.innerHeight + target[3] * window.innerHeight) {
        document.getElementById("skipButton").disabled = true;
        var box = document.createElement('div');
        var left = target[0] * window.innerWidth - container.left;
        var top = target[1] * window.innerHeight - container.top;
        var width = target[2] * window.innerWidth;
        var height = target[3] * window.innerHeight;
        var styleInput = 'position:absolute;border: 2px solid green;left:' + left + 'px;top:' + top + 'px;width:' + width + 'px;height:' + height + 'px';
        box.setAttribute('style', styleInput)
        box.setAttribute('id', 'foundTarget');
        document.querySelector("#imageContainer").append(box);

        targetHit = true;
        clickContent.push(["Correct Click", keys[task], Date.now(), x/window.innerWidth, y/window.innerHeight]);

        firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('targetClicked').transaction(function (current) {
            if (!current) current = [];
            var users = []
            for (const item of current) {
                users.push(item[0]);
            }
            if (!users.includes(userId)) current.push(userId);
            return current
        })

    }
    else {
        clickContent.push(["Incorrect Click", keys[task], Date.now(), x/window.innerWidth, y/window.innerHeight]);
        var wrongMessage = document.createElement('p');
        wrongMessage.textContent = userId + ' got it wrong :(';
        document.querySelector("#clickStatus").append(wrongMessage);
        setTimeout(function() {
            wrongMessage.remove();
        }, 3000);

        misclicks++;
        // update user's misclicks on server
        firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('incorrectClicks').child(userId).transaction(function (current) {
            if (!current) current = 0;
            current = misclicks;
            return current;
        });

        updateIncorrectClicks();
    }
}

function updateIncorrectClicks() {
    // update client-side display with computed total misclicks
    firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('incorrectClicks').transaction(function(current) {
        total = 0;
        for (misclick of Object.values(current)) {
            total += misclick;
        }
        document.getElementById('badclicks').innerHTML = total;
    });
}

var action = '';
function checkTaskComplete() {
    // check if someone skipped or found the target to move on
    console.log('complete');
    var message = document.createElement('div');
    message.textContent = 'Task Complete!';
    message.style.position = 'fixed';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    message.style.color = 'white';
    message.style.padding = '10px';
    message.style.borderRadius = '5px';
    message.style.zIndex = '9999';
    document.body.appendChild(message);
    setTimeout(function() {
        document.body.removeChild(message);
        nextTarget();
    }, 2000);
}

function nextTarget() {
    serverContent.push(["Target Completed", "", Date.now()]);
    serverContent.push(["Clock", document.getElementById('stopwatch').innerHTML]);
    // clickContent.push("Personal Incorrect Clicks:"+misclicks+",\n");

    clearBoxes();
    firebaseRef.child('tasks').child(task).off();
    
    firebaseRef.child('tasks').once('value', function (snap) {
        // snap.val() is the array of users who have correctly clicked on the target.
        // so when we do task = snap.val().length, we're increasing the task by 1
        task = snap.val().length;
        
        // the rest of the code is in here cause of javascript async handling
        misclicks = 0;
        document.getElementById('badclicks').innerHTML = 0;
        targetHit = false;
        mySkipVote = false;
        document.getElementById("skipButton").innerHTML = "Target Absent";
        document.getElementById("skipButton").style.left = '15%';

        if (numTargets == task) {
            document.getElementById("imageSearch").removeEventListener("click", onClick);
            document.getElementById('targetSearch').style.visibility = 'hidden';
            stopStopwatch();
            document.getElementById("skipButton").innerHTML = "All Targets Found!";
            document.getElementById("skipButton").style.left = '5%';
            return;
        }
        document.getElementById("skipButton").disabled = false;
        action = '';
        skipped = 0;
        trial ++;
        getTarget();
    });
}

function clearBoxes() {
    if (document.getElementById('foundTarget')) document.getElementById('foundTarget').remove();
}

let isApplicationStarting = true;

function voteSkipTarget() {
    clickContent.push(["Skip Vote", keys[task], Date.now(), '', '']);

    document.getElementById("skipButton").disabled = true;
    mySkipVote = true;
    firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('skipVotes').transaction(function (current) {
        if (!current) current = [];
        if (!current.includes(userId)) current.push(userId);
        return current
    })
}

function firelist(snapshot) {
    console.log("snapshot.key", snapshot.key);
    if (snapshot.key == 'incorrectClicks') {
        console.log("snapshot.key is incorrectClicks");
        updateIncorrectClicks();
    } else if (snapshot.key == 'targetClicked') {
        found = Object.keys(snapshot.val()).length;
        checkTaskComplete(snapshot);
    }
    else if (snapshot.key == 'skipVotes') {
        skipped = Object.keys(snapshot.val()).length;
        checkTaskComplete(snapshot);
    }
}


function startExp() {
    startStopwatch();
    serverContent.push(["Experiment Start", Date.now()]);

    firebaseRef.child('tasks').once('value', function (snap) {
        if (snap.val() !== null)
            task = snap.val().length - 1;

    });
    getImage(trial);
    getTarget();
}

//Used to get bounding box parameters manually and then inputting into "boundArray" dictionary above
// var c1 = true;
// var x1;
// var y1;
// document.getElementById("imageSearch").addEventListener("click", whereAmI);
// function whereAmI(event) {
//     if (!c1) {
//         console.log(x1 + '/' + window.innerWidth + ', ' + y1 + '/' + window.innerHeight + ', ' + (event.clientX - x1) + '/' + window.innerWidth + ', ' + (event.clientY - y1) + '/' + window.innerHeight)
//     }
//     x1 = event.clientX;
//     y1 = event.clientY;
//     c1 = !c1;
// }
document.getElementById("imageSearch").style.pointerEvents = "none";
document.getElementById("skipButton").style.pointerEvents = "none";
firebaseRef.child('users').on('value', function (snapshot) {
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

    if (Object.keys(snapshot.val()).length >= numPpl) {
        startExp();
        firebaseRef.child("users").transaction(function (current) {
            for (const [key, value] of Object.entries(current)) {
                var wh = "("+value.dimensions.w+","+value.dimensions.h+")";
                serverContent.push([key,wh]);
            }
        })
        document.getElementById("imageSearch").style.pointerEvents = "auto";
        document.getElementById("skipButton").style.pointerEvents = "auto";
        firebaseRef.child('users').off('value');
    }
})


fetch('./generateTrials/trial.csv')
    .then(response => response.text())
    .then(csvData => {
        const rows = csvData.split('\n');
        const columns = rows[0].split(',');
        const nameIndex = columns.indexOf('name');
        const idIndex = columns.indexOf('id');
        const sizeIndex = columns.indexOf('size');
        const absentIndex = columns.indexOf('absent');
        const letter1Index = columns.indexOf('letter_1');
        const x1Index = columns.indexOf('x_1');
        const y1Index = columns.indexOf('y_1');
        const rotation1Index = columns.indexOf('rotation_1');

        const selectedData = rows.slice(1).map(row => {
            const values = row.split(',');
            return {
                name: values[nameIndex],
                id: values[idIndex],
                size: values[sizeIndex],
                absent: values[absentIndex],
                letter_1: values[letter1Index],
                x_1: values[x1Index],
                y_1: values[y1Index],
                rotation_1: values[rotation1Index]
            };
        });

        // Use the 'selectedData' array here
        console.log(selectedData);
    })
    .catch(error => {
        console.error('Error fetching CSV file:', error);
    });