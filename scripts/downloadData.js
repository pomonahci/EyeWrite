/**
 * downloadData.js defines listener for downloading CSV files of experiment data
 *
 * Name: nickmarsano
 * Date: 7/23/21
 */

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function createCSV(filename, content) {
    var csv = "";
    content.forEach(function (row) {
        csv += row.join(',');
        csv += "\n";
    });

    var hiddenElement = document.createElement('a');
    const encodedURI = encodeURI(csv);
    const fixedEncodedURI = encodedURI.replaceAll('#', '%23');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + fixedEncodedURI;
    hiddenElement.target = '_blank';
    hiddenElement.download = filename + '.csv';
    hiddenElement.click();
}

var fileName = '';//file name as a string
var clickContent = [['action', 'target', 'timestamp', 'x', 'y', 'condition']];
// var mouseContent = [['x', 'y', 'timestamp']];
var overlayContent = [];
var gazeContent = [['x/window.innerWidth', 'y/window.innerhHeight', 'timestamp']];
var serverContent = [['Parameter', 'Value', 'Timestamp']];
function unloading() {
    serverContent.push("Closing Page @ " + Date.now());
    var content0 = '';
    var content1 = '';
    var content2 = '';
    var content3 = '';
    for (const item of clickContent) {
        content0 = content0 + item;

    }
    for (const item of mouseContent) {
        content1 = content1 + item;
    }
    for (const item of gazeContent) {
        content2 = content2 + item;
    }
    var chosen = false;
    firebaseRef.child('users').once('value', function (snap) {
        for (const user of Object.keys(snap.val())) {
            if (!chosen || chosen > user) {
                chosen = user;
            }
        }
        if (chosen = userId) {
            chosen = true;
        }
        else {
            chosen = false;
        }
    });
    if (chosen) {
        for (const arr of serverContent) {
            for (const item of arr) {
                content3 = content3 + item;
            }
        }
        download(fileName + '_server', content3);
    }
    download(fileName + '_' + userId + '_actions', content0);
    download(fileName + '_' + userId + '_mouse', content1);
    download(fileName + '_' + userId + '_gaze', content2);
}


// Process the overlap data
function processOverlapData(data) {
    const headers = ['timestamp', 'x', 'y','condition', 'image', 'user1', 'user2', 'user3', 'user4', 'user5', 'user6'];
    const content = [headers];

    // Flatten and process the nested structure
    data.forEach(outerArray => {
        outerArray.forEach(innerArray => {
            if (Array.isArray(innerArray) && innerArray.length > 0) {
                const timestamp = innerArray[0].time;
                const x = innerArray[0].x;
                const y = innerArray[0].y;
                const condition = innerArray[0].condition;
                const image = innerArray[0].image;
                const users = innerArray.map(item => item.user);

                const row = [timestamp, x, y, condition, image, ...users, ...Array(6 - users.length).fill('')];
                content.push(row);
            }
        });
    });

    return content;
}


// Updated function to remove duplicates from serverContent using floor for timestamps
function removeDuplicatesFromServerContent(content) {
    const seen = new Set();
    return content.filter((row, index) => {
        // Skip the header row
        if (index === 0) return true;
        
        // Assuming Parameter is in the first column (index 0) and timestamp is in the third column (index 2)
        const parameter = row[0];
        const timestamp = row[2];
        console.log(row);
        
        // If parameter or timestamp is undefined or empty string, keep the row
        if (parameter === undefined || parameter === '' || timestamp === undefined || timestamp === '') return true;
        
        // Floor the timestamp to the nearest 10 (remove last digit)
        const flooredTimestamp = Math.floor(parseFloat(timestamp) / 10) * 10;
        
        const key = `${parameter}_${flooredTimestamp}`;
        if (seen.has(key)) {
            return false; // This is a duplicate, don't keep it
        }
        seen.add(key);
        return true; // This is not a duplicate, keep it
    });
}

function unloadingCSV() {
    // createCSV(fileName + "_" + userId + "_mouse", mouseContent);
    // createCSV(fileName + "_" + userId + "_action", clickContent);
    const overlapData = processOverlapData(overlayContent);
    // createCSV(fileName + '_overlap_data', overlapData);
    var chosen = false;
    firebaseRef.child('users').once('value', function (snap) {
        for (const user of Object.keys(snap.val())) {
            if (!chosen || chosen > user) {
                chosen = user;
            }
        }
        if (chosen = userId) {
            chosen = true;
        }
        else {
            chosen = false;
        }
    });
    if (chosen) {
        // Remove duplicates from serverContent before creating CSV
        const uniqueServerContent = removeDuplicatesFromServerContent(serverContent);
        createCSV(fileName + "_server", uniqueServerContent);
    }
}
// window.addEventListener('beforeunload', unloading);
// window.addEventListener('beforeunload', unloadingCSV);
