/**
 * imageSelect.js controls the image search task
 * Interprets URL for image and targets, handles server interaction and target control
 * 
 * Name: nickmarsano, Haram Yoon
 * Date: 06/30/2021
 */

var imageContainer = document.getElementById('imageContainer');
var container = imageContainer.getBoundingClientRect();


// var imageLabel;

let images = ['21_present_1.jpg', '21_present_2.jpg', '21_present_3.jpg', '21_present_4.jpg', '21_present_5.jpg', '21_present_6.jpg', '21_present_7.jpg', '21_present_8.jpg', '21_present_9.jpg', '21_present_10.jpg', '21_present_11.jpg', '21_present_12.jpg',
    '21_absent_1.jpg', '21_absent_2.jpg', '21_absent_3.jpg', '21_absent_4.jpg', '21_absent_5.jpg', '21_absent_6.jpg', '21_absent_7.jpg', '21_absent_8.jpg', '21_absent_9.jpg', '21_absent_10.jpg', '21_absent_11.jpg', '21_absent_12.jpg',
    '35_present_1.jpg', '35_present_2.jpg', '35_present_3.jpg', '35_present_4.jpg', '35_present_5.jpg', '35_present_6.jpg', '35_present_7.jpg', '35_present_8.jpg', '35_present_9.jpg', '35_present_10.jpg', '35_present_11.jpg', '35_present_12.jpg',
    '35_absent_1.jpg', '35_absent_2.jpg', '35_absent_3.jpg', '35_absent_4.jpg', '35_absent_5.jpg', '35_absent_6.jpg', '35_absent_7.jpg', '35_absent_8.jpg', '35_absent_9.jpg', '35_absent_10.jpg', '35_absent_11.jpg', '35_absent_12.jpg'];

// Utility function to shuffle an array elements in random order
function shuffleArray(array) {
    let shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
// const images = shuffleArray(presuffled_images);
console.log(images);

let imageName // name of the image to be displayed
const boundArray = [160, 25, 2360, 1270] // [left, top, right, bottom] of the image area


// Fetch trials data from CSV file
let selectedData = []
  fetch('./generateTrials/trials.csv')
    .then(response => response.text())
    .then(csvData => {
        const rows = csvData.split('\n');
        const columns = rows[0].split(',');
        const nameIndex = columns.indexOf('name');
        const idIndex = columns.indexOf('id');
        const sizeIndex = columns.indexOf('size');
        const absentIndex = columns.indexOf('absent');
        const letter1Index = columns.indexOf('letter_1');
        const x = columns.indexOf('x_1');
        const y = columns.indexOf('y_1');
        const rotation = columns.indexOf('rotation_1')
         
        // Parse the CSV data into an array of objects
        selectedData = rows.slice(1).map(row => {
            const values = row.split(',');
            return {
                name: values[nameIndex],
                id: values[idIndex],
                size: values[sizeIndex],
                absent: values[absentIndex],
                letter_1: values[letter1Index],
                x: values[x],
                y: values[y],
                rotation: values[rotation],
            };
        });
        console.log(selectedData);
        
    })
    .catch(error => {
        console.error('Error fetching CSV file:', error);
    });


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

function getTrial() {
    // firebaseRef.child('tasks').child(task).child('targetClicked').set("");
    // firebaseRef.child('tasks').child(task).child('incorrectClicks').set("");
    // firebaseRef.child('tasks').child(task).child('skipVotes').set("");

    // firebaseRef.child('tasks').child(task).child('targetClicked').on('child_added', checkTaskComplete);//useless in experiments with more than 1 person
    // firebaseRef.child('tasks').child(task).child('targetClicked').on('child_changed', checkTaskComplete);
    // firebaseRef.child('tasks').child(task).child('incorrectClicks').on('child_changed', updateIncorrectClicks);

    // Listen for changes in the 'tasks' node of the Firebase database
    firebaseRef.child('tasks').child(task).on('child_added', firelist);
    firebaseRef.child('tasks').child(task).on('child_changed', firelist);
    
    // Get the image name from the images array
    let imageName = images[task];
    console.log("imageName:",imageName)
    // Get the target data for the image name from the selectedData array
    let target = selectedData.find(data => data.name === imageName);
    console.log("target:",target)
    // Display the image on the page
    document.getElementById("imageSearch").src = "./generateTrials/images/" + target.name;
    // Add an about section to the task in the Firebase database
    firebaseRef.child('tasks').child(task).child('about').set(target);
    // Log task start details to the server
    serverContent.push(["Target", task, Date.now()]);
    serverContent.push(["Participants", numPpl]);
    serverContent.push(["Image", target.name]);
    console.log(serverContent, task)
}
// Add an event listener for each click on the image
document.getElementById("imageSearch").addEventListener("click", onClick);
function onClick(event) {
    // Early return if the user has already voted to skip or if the target has been hit
    if (mySkipVote || targetHit) return;

    // Get the x and y coordinates of the click
    var clickX = event.clientX;
    var clickY = event.clientY;
    console.log("x:",clickX, "y:",clickY)  

    // Get the target data for the image name from the selectedData array for its coordinates
    const imageName = images[task];
    target = selectedData.find(data => data.name === imageName)

    // Get the bounding box coordinates for the target "O"
    const rectHeight = 16;
    const rectWidth = 13.7783203125;
    const topLeftX = parseFloat(target.x) - (rectWidth / 2) + boundArray[0];
    const topLeftY = parseFloat(target.y) - (rectHeight / 2) + boundArray[1];
    const bottomRightX = parseFloat(target.x) + (rectWidth / 2) + boundArray[0];
    const bottomRightY = parseFloat(target.y) + (rectHeight / 2) + boundArray[1];
    console.log("target:",topLeftX,topLeftY,bottomRightX,bottomRightY) 

    // Add the click to the Firebase database
    firebaseRef.child('tasks').child(task).child('clicks').push({
        x: clickX,
        y: clickY,
        time: Date.now(),
        user: userId
    });

    // Check if the click is within the bounding box of the target
    if (clickX >= topLeftX &&
        clickX <= bottomRightX &&
        clickY >= topLeftY &&
        clickY <= bottomRightY) {
        // If the click is within the bounding box, draw a red box around the target
        document.getElementById("skipButton").disabled = true;
        var box = document.createElement('div');
        box.setAttribute('style', `border: 2px solid red; box-sizing: border-box; position: absolute; top: ${topLeftY}px; left: ${topLeftX - boundArray[0]}px; width: ${rectWidth}px; height: ${rectHeight}px;`);
        // Set the id of the box to 'foundTarget' so it can be removed later
        box.setAttribute('id', 'foundTarget');
        document.querySelector("#imageContainer").append(box);

        // Log the correct click to the server
        targetHit = true;
        clickContent.push(["Correct Click", target.name, Date.now(), clickX/window.innerWidth, clickY/window.innerHeight]);
        
        // Update the user's correct clicks on the server
        firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('targetClicked').set({
            user: userId,
            time: Date.now()
        });

    }
    else {
        // Log the incorrect click to the server
        clickContent.push(["Incorrect Click", target.name, Date.now(), clickX/window.innerWidth, clickY/window.innerHeight]);
        
       // Increment the user's misclicks
        misclicks++;
        // update user's misclicks on firebase
        firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('incorrectClicks').child(userId).transaction(function (current) {
            if (!current) current = 0;
            current = misclicks;
            return current;
        });
        // update client-side display with misclicks
        updateIncorrectClicks();
    }
}

// Function to update the client-side display with the total misclicks
function updateIncorrectClicks() {
    // Pull the misclicks from the Firebase database and update the display
    firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('incorrectClicks').transaction(function(current) {
        total = 0;
        for (misclick of Object.values(current)) {
            total += misclick;
        }
        document.getElementById('badclicks').innerHTML = total;
    });
}

// Function when task is completed
function checkTaskComplete() {
    console.log('complete');

    // Display a message to the user that the task is complete
    var message = document.createElement('div');
    message.textContent = 'Task Completed by ' + userId + '!';

    // Get the user name from userId in Firebase
    firebaseRef.child('users').child(userId).child('name').once('value', function(snapshot) {
        var userName = snapshot.val();
        message.textContent = 'Task Completed by ' + userName + '!';
    });

    // Style the message and display it for 2 seconds
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


// Function to move to the next target
function nextTarget() {
    // Log the target completion to the server
    serverContent.push(["Target Completed", "", Date.now()]);
    serverContent.push(["Clock", document.getElementById('stopwatch').innerHTML]);
    // clickContent.push("Personal Incorrect Clicks:"+misclicks+",\n");

    clearBoxes();
    // Remove the event listener for the image
    firebaseRef.child('tasks').child(task).off();


    // Reset everything for the next target
    firebaseRef.child('tasks').once('value', function (snap) {
        // snap.val() is the array of users who have correctly clicked on the target.
        // so when we do task = snap.val().length, we're increasing the task by 1        
        // the rest of the code is in here cause of javascript async handling
        misclicks = 0;
        document.getElementById('badclicks').innerHTML = 0;
        targetHit = false;
        mySkipVote = false;
        document.getElementById("skipButton").innerHTML = "Target Absent";
        document.getElementById("skipButton").style.left = '15%';

        // check if all targets have been found
        // if so, stop the stopwatch and display a message
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
        // increment the task and get the next trial
        task ++;
        getTrial();

    });
}


// Function to clear the red bounding box around the target
function clearBoxes() {
    if (document.getElementById('foundTarget')) document.getElementById('foundTarget').remove();
}

// Function to skip the current target
function voteSkipTarget() {
    // get the target from the image name from the images array
    const imageName = images[task];
    let target = selectedData.find(data => data.name === imageName);

    // Log the skip vote to the server
    clickContent.push(["Skip Vote", target.name, Date.now(), '', '']);

    // disable the skip button(do for all later)
    document.getElementById("skipButton").disabled = true;
    mySkipVote = true;

    // Add who voted for no Target to the Firebase database
    firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('noTarget').set({
        user: userId,
        time: Date.now()
    });
}


// Function to handle snapshot changes in the Firebase database according to the key
function firelist(snapshot) {
    console.log("snapshot.key", snapshot.key);
    if (snapshot.key == 'incorrectClicks') {
        console.log("snapshot.key is incorrectClicks");
        updateIncorrectClicks();
    } else if (snapshot.key == 'targetClicked') {
        console.log("snapshot.key is targetClicked");
        checkTaskComplete();
    }
    else if (snapshot.key == 'noTarget') {
        console.log("snapshot.key is noTarget");
        checkTaskComplete();
    }
}

// Function to start the experiment
function startExp() {
    startStopwatch();
    serverContent.push(["Experiment Start", Date.now()]);
    // Get the first trial
    firebaseRef.child('tasks').once('value', function (snap) {
        task =0 

    });
    getTrial();
}


document.getElementById("imageSearch").style.pointerEvents = "none";
document.getElementById("skipButton").style.pointerEvents = "none";

// get the number of participants from the URL
firebaseRef.child('users').on('value', function (snapshot) {
    var URL = window.location.href;
    // imageLabel = URL.search("img");
    // imageLabel = URL.substring(imageLabel + 4, imageLabel + 5);
    // if (imageLabel == -1) return;
    numPpl = URL.search('par');
    if (numPpl == -1) {
        numPpl = 2;
    }
    else {
        numPpl = URL.substring(numPpl + 4, numPpl + 5);
    }

    // check if the number of participants have joined to start the experiment
    if (Object.keys(snapshot.val()).length >= numPpl) {
        startExp();
        // add the users' dimensions into the firebase database
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


