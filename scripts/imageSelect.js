/**
 * imageSelect.js controls the image search task
 * Interprets URL for image and targets, handles server interaction and target control
 * 
 * Name: nickmarsano, Haram Yoon
 * Date: 06/30/2021
 */
/**
 * imageSelect.js controls the image search task
 * Interprets URL for image and targets, handles server interaction and target control
 * 
 * Name: nickmarsano, Haram Yoon
 * Date: 06/30/2021
 */
var imageContainer = document.getElementById('imageContainer');
var container = imageContainer.getBoundingClientRect();


var imageLabel;

var images = []

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
                x: values[x] + boundArray[0],
                y: values[y] + boundArray[1],
                rotation: values[rotation],
            };
        });
    })
    .catch(error => {
        console.error('Error fetching CSV file:', error);
    });


var bounding; // list of targets for imageLabel taken from boundArray
var misclicks = 0; // number of misclicks while searching for target (will be made global)
var targetHit = false; // boolean value to determine if a bounding box should be drawn locally (only draw once)
var numTargets; // number of targets to find per image
var task = 0; // index of target, will incremenent
var numPpl; // number of participants in this experiement (gotten from URL)
var url; //apache url
var found = 0;
var skipped = 0;
var mySkipVote = false;
var is_warmup = false;

function getTrial() {

    // Listen for changes in the 'tasks' node of the Firebase database
    firebaseRef.child('tasks').child(condition).child(task).on('child_added', firelist);
    firebaseRef.child('tasks').child(condition).child(task).on('child_changed', firelist);
  
    // Get the image name from the images array
    let imageName = images[task];
    // Display the image on the page
    // Log task start details to the server
    if (imageName){
        const imageSrc = is_warmup ? `./generateTrials/images/warmup/${imageName}` : `./generateTrials/images/${imageName}`;
        document.getElementById("imageSearch").src = imageSrc;
        console.log('image: ', imageName)
        serverContent.push(["Trial Start", task, Date.now()]);
        serverContent.push(["Image", imageName, Date.now()]);
        window.imageSelectData.imageName = imageName;
    }
    // resetStopwatch()
    startStopwatch();
    document.getElementById('trialNumber').innerHTML = task + 1;
}
// Add an event listener for each click on the image
document.getElementById("imageSearch").addEventListener("click", onClick);
async function onClick(event) {
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
    firebaseRef.child('tasks').child(condition).child(task).child('clicks').push({
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
        clickContent.push(["Correctly Clicked", target.name, Date.now(), clickX, clickY, condition]);
        
        // Update the user's correct clicks on the server as long action hasn't been (for actions done at similar time)
        await firebaseRef.child('tasks').child(condition).child(task).child('noTarget').once('value')
            .then(snapshot => {
                if (!snapshot.exists()) {
                    return firebaseRef.child('tasks').child(condition).child(task).child('targetClicked').once('value');
                }
            })
            .then(snapshotClicked => {
                if (!snapshotClicked.exists()) {
                    return firebaseRef.child('tasks').child(condition).child(task).child('targetClicked').set({
                        user: userId,
                        time: Date.now()
                    });
                }
            });
    }
    else {
        // Log the incorrect click to the server
        clickContent.push(["Incorrect Click", target.name, Date.now(), clickX, clickY, condition]);
        
       // Increment the user's misclicks
        misclicks++;
        // update user's misclicks on firebase
        firebaseRef.child('tasks').child(condition).child(task).child('incorrectClicks').child(userId).transaction(function (current) {
            return (current || 0) + 1;
        });
        // update client-side display with misclicks
        updateIncorrectClicks();
    }
}

// Function to update the client-side display with the total misclicks
function updateIncorrectClicks() {
    // Pull the misclicks from the Firebase database and update the display
    firebaseRef.child('tasks').child(condition).child(task).child('incorrectClicks').transaction(function(current) {
        total = 0;
        for (misclick of Object.values(current)) {
            total += misclick;
        }
        document.getElementById('badclicks').innerHTML = total;
    });
}

// Function when task is completed
async function checkTaskComplete() {
    console.log('complete');
    // Get the image name from the images array
    let imageName = images[task];
    // Get the target data for the image name from the selectedData array
    let target = selectedData.find(data => data.name === imageName);

    try {
        // add the target to the firebase database
        await firebaseRef.child('tasks').child(condition).child(task).child('about').set(target);

        // Get the task data from the Firebase database to check if for completed action type
        const taskSnapshot = await firebaseRef.child('tasks').child(condition).child(task).once('value');
        const taskData = taskSnapshot.val();

        // default values for user who did action and actionType
        let userId = null;
        let actionType = '';

        // Get the user who completed the task and the action type
        // Check if the target was clicked
        if (taskData.targetClicked && taskData.targetClicked.user) {
            userId = taskData.targetClicked.user;
            actionType = 'Right';
        // Check if the Skip button was clicked
        } else if (taskData.noTarget && taskData.noTarget.user) {
            userId = taskData.noTarget.user;
            actionType = imageName.includes('absent') ? 'Right' : 'Wrong';
        }
        document.getElementById("skipButton").disabled = true;

        // add updated right, wrong, money to the firebase database
        updateGlobalState(actionType);

            // Get the color of the user who completed the task
        if (userId) {
            const colorSnapshot = await firebaseRef.child('users').child(userId).child('color').once('value');
            const color = colorSnapshot.val();
            displayMessage(`${actionType} `, color, actionType);
        } else {
            displayMessage("Task Completed!");
        }

    } catch (error) {
        console.error("Error checking task completion:", error);
        displayMessage("Error!");
    }
}

// Update the global state with the task completion 
function updateGlobalState(actionType) {
    const globalStateRef = firepad.firebaseAdapter_.ref_.child('globalState');
    if (is_warmup) return;
    
    // Update the count for the specific action type
    globalStateRef.child(actionType).transaction(currentValue => {
        return (currentValue || 0) + 1/numPpl;
    });
    
    // Update the money
    globalStateRef.child('money').transaction(currentValue => {
        const change = actionType === 'Right' ? 0.035 : -0.07;
        return (currentValue || 0) + change/numPpl;
    });
    }
    

function displayMessage(text, color, actionType) {
    // Display a message on the screen for 2 seconds
    // with the text and color provided
    var message = document.createElement('div');
    message.textContent = text;
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

    var colorBox = document.createElement('div');
    colorBox.style.backgroundColor = color;
    colorBox.style.width = '20px';
    colorBox.style.height = '20px';
    colorBox.style.marginLeft = '10px';
    colorBox.style.display = 'inline-block';
    message.appendChild(colorBox);
    document.getElementById("imageSearchUI").style.backgroundColor = actionType === 'Right' ? '#3cb371' : '#ff6347';
    document.getElementById("userlist").style.backgroundColor = actionType === 'Right' ? '#3cb371' : '#ff6347';

    // Remove the message after 2 seconds and move to the next target
    setTimeout(function() {
        document.body.removeChild(message);
        nextTarget(actionType);
        stopStopwatch();
        resetStopwatch();

        // Reset the background color to grey after 2 seconds
        document.getElementById("imageSearchUI").style.backgroundColor = 'white';
        document.getElementById("userlist").style.backgroundColor = 'white';
    }, 2000);
}



// Function to move to the next target
async function nextTarget(actionType) {
    // Log the target completion to the server
    console.log("nextTarget")
    serverContent.push(["Trial Completed", actionType, Date.now()]);
    const stopwatchTime = document.getElementById('stopwatch').innerHTML;
    const [hours, minutes, seconds] = stopwatchTime.split(':').map(Number);
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    serverContent.push(["Total Seconds", totalSeconds, Date.now()]);
    console.log(serverContent, task);

    clearBoxes();
    // Remove the event listener for the image
    firebaseRef.child('tasks').child(condition).child(task).off();

    try {
        // Get the number of tasks completed so far (how we increment tasks)
        const snapshot = await firebaseRef.child('tasks').child(condition).once('value');
        task = snapshot.val().length;
        // Reset everything for the next target
        misclicks = 0;
        document.getElementById('badclicks').innerHTML = 0;
        targetHit = false;
        mySkipVote = false;
        document.getElementById("skipButton").innerHTML = "No Target";
        document.getElementById("skipButton").style.left = '15%';

        // Check if all tasks are completed
        if (numTargets == task) {
            console.log("All tasks completed!");
            document.getElementById("imageSearch").removeEventListener("click", onClick);
            stopStopwatch();
            // Reset the global state
            await firebaseRef.child('globalState').child('buttonClicked').set(false);
            await firebaseRef.child('globalState').child('WarmupbuttonClicked').set(false);

            // Download csv files if experiment is completed
            const tasksSnapshot = await firebaseRef.child('tasks').once('value');
            if ((numPpl == 1 && tasksSnapshot.numChildren() == 2) || 
                (numPpl > 1 && tasksSnapshot.numChildren() == 6)) {
                unloadingCSV();
            }

            // Let participants know that all tasks are completed
            document.getElementById("skipButton").innerHTML = "All Tasks Completed!";
            alert("All tasks completed!");
            // Reset the image and enable the start button for next condition
            document.getElementById("imageSearch").src = "";
            document.getElementById("skipButton").style.left = '5%';
            document.getElementById("skipButton").disabled = true;
            document.getElementById("startButton").disabled = false;
            document.getElementById("startWarmupButton").disabled = false;
            return;
        }
        document.getElementById("skipButton").disabled = false;
        skipped = 0;
        // Get the next trial based on updated task var
        getTrial();
    } catch (error) {
        console.error("Error in nextTarget:", error);
    }
}


// Function to clear the red bounding box around the target
function clearBoxes() {
    if (document.getElementById('foundTarget')) document.getElementById('foundTarget').remove();
}

let isTaskCompletionInProgress = false;
// Function to skip the current target
async function voteSkipTarget() {
    if (isTaskCompletionInProgress) return;
    // get the target from the image name from the images array
    const imageName = images[task];
    let target = selectedData.find(data => data.name === imageName);

    // disable the skip button(do for all later)
    document.getElementById("skipButton").disabled = true;
    mySkipVote = true;
    clickContent.push(["Skip Vote", target.name, Date.now(), '', '', condition]);

    // Update the user's noTarget on the server as long action hasn't been (for actions done at similar time)
    await firebaseRef.child('tasks').child(condition).child(task).child('noTarget').once('value')
    .then(snapshot => {
        if (!snapshot.exists()) {
            return firebaseRef.child('tasks').child(condition).child(task).child('targetClicked').once('value');
        }
    })
    .then(snapshotClicked => {
        if (!snapshotClicked.exists()) {
            return firebaseRef.child('tasks').child(condition).child(task).child('noTarget').set({
                user: userId,
                time: Date.now()
            });
        }
    });
}


// Function to handle snapshot changes in the Firebase database according to the key
function firelist(snapshot) {
    // fix for bug where multiple events are triggered
    if (isTaskCompletionInProgress) {
        console.log("Task completion already in progress. Ignoring additional events.");
        return;
    }
    // When someone incorrectly clicks
    if (snapshot.key == 'incorrectClicks') {
        console.log("snapshot.key is incorrectClicks");
        updateIncorrectClicks();
    // when someone skips or presses target
    } else if (snapshot.key == 'targetClicked' || snapshot.key == 'noTarget') {
        console.log(`snapshot.key is ${snapshot.key}`);
        //  if action not already being process, check task completion
        if (!isTaskCompletionInProgress) {
            isTaskCompletionInProgress = true;
            checkTaskComplete().then(() => {
                isTaskCompletionInProgress = false;
            }).catch(error => {
                console.error("Error in checkTaskComplete:", error);
                isTaskCompletionInProgress = false;
            });
        }
    }
}

// Function to start the experiment or warmup session
async function startExperiment(isWarmup) {
    // Determine which button type to use based on whether it's a warmup or not
    const buttonType = isWarmup ? 'WarmupbuttonClicked' : 'buttonClicked';
    const buttonId = isWarmup ? 'startWarmupButton' : 'startButton';
    
    try {
        // Reset the global state for the appropriate button type
        await firebaseRef.child('globalState').child(buttonType).set(false);
        
        // Set up the event listener for the start button
        document.getElementById(buttonId).addEventListener('click', function() {
            firebaseRef.child('globalState').child(buttonType).set(true);
        });
        
        // Listen for changes in the global state
        firebaseRef.child('globalState').child(buttonType).on('value', async function(snapshot) {
            // Check if the button has been clicked (value is true)
            if (snapshot.val()) {
                // Disable start buttons and enable skip button
                document.getElementById("startButton").disabled = true;
                document.getElementById("startWarmupButton").disabled = true;
                document.getElementById("skipButton").disabled = false;
                
                // Add click event listener to the image
                document.getElementById("imageSearch").addEventListener("click", onClick);
                
                // Set the skip button text
                document.getElementById("skipButton").innerHTML = "No Target"; 
                
                // Set the condition based on whether it's a warmup or not
                condition = isWarmup ? document.getElementById("warmups").value + "_warmup" : document.getElementById("condition").value;
                window.imageSelectData.condition = condition;
                is_warmup = isWarmup;
                
                // Set the 'unique' value based on the condition (used for gaze visualization)
                unique = condition.startsWith("SG") ? 1 : 2;
                
                // Reset the task counter
                task = 0;
                
                try {
                    // Fetch the shuffled images for the current condition
                    const imagesSnapshot = await firebaseRef.child('shuffledImages').child(condition).once('value');
                    images = imagesSnapshot.val();
                    
                    // Set the number of targets and update the UI
                    numTargets = images.length;
                    document.getElementById('trialLength').innerHTML = numTargets;
                    
                    // Log the start of the condition
                    serverContent.push([`Condition Start (${condition})`, isWarmup ? "Warmup" : "Experiment", Date.now()]);
                    console.log('starting');
                    
                    // Start the first trial
                    getTrial();
                } catch (error) {
                    console.error('Error fetching shuffled images:', error);
                }
            }
        });
    } catch (error) {
        console.error('Error starting experiment:', error);
    }
}

// Function to start the experiment
function startExp() {
    startExperiment(false);
}

// Function to start the warmup
function startWarmup() {
    startExperiment(true);
}


document.getElementById("imageSearch").style.pointerEvents = "none";
document.getElementById("skipButton").style.pointerEvents = "none";

// get the number of participants from the URL
firebaseRef.child('users').on('value', function (snapshot) {
    var URL = window.location.href;
    numPpl = URL.search('par');
    if (numPpl == -1) {
        numPpl = 2;
    }
    else {
        numPpl = URL.substring(numPpl + 4, numPpl + 5);
    }

    // check if the number of participants have joined to start the experiment
    if (Object.keys(snapshot.val()).length >= numPpl) {
        document.getElementById("startButton").disabled = false;
        document.getElementById("startWarmupButton").disabled = false;
        shuffleImages();
        startExp();
        startWarmup();
        // add the users' dimensions into the firebase database
        setTimeout(function() {
            firebaseRef.child("users").transaction(function (current) {
                for (const [key, value] of Object.entries(current)) {
                    var wh = "("+value.dimensions.w+","+value.dimensions.h+")";
                    serverContent.push([`${key} dimension`,wh]);
                    serverContent.push([`${key} color`, value.color]);
                    serverContent.push([`${key} name`, value.name]);
                }
                serverContent.push(["Participants", numPpl]);
            });
        }, 1000);
        document.getElementById("imageSearch").style.pointerEvents = "auto";
        document.getElementById("skipButton").style.pointerEvents = "auto";
        firebaseRef.child('users').off('value');
    }
})


window.imageSelectData = {
    imageName: "",
    condition: ""
};