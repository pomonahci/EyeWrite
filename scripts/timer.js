/**
 * timer.js defines a timer feature to be placed in a div element
 *
 * Name: nickmarsano
 * Date: 7/23/21
 */

const timer = document.getElementById('timer');

var hr = 0;
var min = 5;
var sec = 0;
var stoptime = true;
var neg = false;

function startTimer(mins) {
    if (mins) min = mins;
    if (stoptime == true) {
        stoptime = false;
        timerCycle();
    }
}
function stopTimer() {
    if (stoptime == false) {
        stoptime = true;
    }
}

function timerCycle() {
    if (stoptime == false) {
        sec = parseInt(sec);
        min = parseInt(min);
        hr = parseInt(hr);

        if (!neg) {
            sec = sec - 1;

            if (sec == -1) {
                min = min - 1;
                sec = 59;
            }
            if (min == -1) {
                hr = hr - 1;
                if (hr == -1) hr = 0;
                min = 59;
                sec = 59;
            }

            if (sec < 10 || sec == 0) {
                sec = '0' + sec;
            }
            if (min < 10 || min == 0) {
                min = '0' + min;
            }
            if (hr < 10 || hr == 0) {
                hr = '0' + hr;
            }
        }
        else {
            sec = sec + 1;

            if (sec == 60) {
                min = min + 1;
                sec = 0;
            }
            if (min == 60) {
                hr = hr + 1;
                min = 0;
                sec = 0;
            }

            if (sec < 10 || sec == 0) {
                sec = '0' + sec;
            }
            if (min < 10 || min == 0) {
                min = '0' + min;
            }
            if (hr < 10 || hr == 0) {
                hr = '0' + hr;
            }
        }
        if (hr == '00' && min == '00' && sec == '00') {
            $("#timeholder").contents().filter(function () {
                return this.nodeType == 3;
            })[0].nodeValue = "Overtime: ";
            neg = true;
        }
        timer.innerHTML = hr + ':' + min + ':' + sec;
        if (neg && sec != '00') {
            timer.innerHTML = '-' + hr + ':' + min + ':' + sec;
        }

        setTimeout("timerCycle()", 1000);
    }
}

function resetTimer(min) {
    if (min < 10) min = '0' + min;
    timer.innerHTML = '00:' + min + ':00';
    stoptime = true;
    hr = 0;
    sec = 0;
    min = 0;
}