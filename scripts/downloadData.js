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
var clickContent = [['action', 'target', 'timestamp', 'x', 'y']];
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



function processOverlapData(data) {
    const headers = ['timestamp', 'user1', 'x1', 'y1', 'user2', 'x2', 'y2', 'user3', 'x3', 'y3', 'user4', 'x4', 'y4', 'user5', 'x5', 'y5', 'user6', 'x6', 'y6'];
    const content = [headers];

    // Flatten and process the nested structure
    data.forEach(outerArray => {
        outerArray.forEach(innerArray => {
            if (Array.isArray(innerArray) && innerArray.length > 0) {
                const timestamp = innerArray[0].time;
                const row = new Array(19).fill('');
                row[0] = timestamp;

                innerArray.forEach((item, index) => {
                    if (index < 6) { // Limit to 6 users
                        const baseIndex = 1 + index * 3;
                        row[baseIndex] = item.user;
                        row[baseIndex + 1] = item.x !== undefined ? item.x : '';
                        row[baseIndex + 2] = item.y !== undefined ? item.y : '';
                    }
                });

                content.push(row);
            }
        });
    });

    return content;
}


function unloadingCSV() {
    // createCSV(fileName + "_" + userId + "_mouse", mouseContent);
    createCSV(fileName + "_" + userId + "_action", clickContent);
    const overlapData = processOverlapData(overlayContent);
    createCSV(fileName + '_overlap_data', overlapData);
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
        createCSV(fileName + "_server", serverContent);
    }

}
// window.addEventListener('beforeunload', unloading);
// window.addEventListener('beforeunload', unloadingCSV);