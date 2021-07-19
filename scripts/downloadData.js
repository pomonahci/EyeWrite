function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
var fileName = '';//file name as a string
var clickContent = [];//array of different strings that will be added to the file
var mouseContent = [];
var gazeContent = [];
var serverContent = [[], []];
function unloading() {
    serverContent.push("Closing Page @ "+Date.now());
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

window.addEventListener('beforeunload', unloading);