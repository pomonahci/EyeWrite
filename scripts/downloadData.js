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
var clickContent = [['action', 'timestamp', 'color', 'width', 'idCreator', 'idStroke', 'status', 'idMovedFrom', 'created', 'timeStart', 'timeEnd', 'undone', 'coords']];
var mouseContent = [['x/window.innerWidth', 'y/window.innerhHeight', 'timestamp']];
var gazeContent = [['x/window.innerWidth', 'y/window.innerhHeight', 'timestamp']];
var serverContent = [['Parameter', 'Value']];
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
function unloadingCSV() {
    createCSV(fileName + "_" + userId + "_mouse", mouseContent);
    createCSV(fileName + "_" + userId + "_action", clickContent);
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
window.addEventListener('beforeunload', unloadingCSV);