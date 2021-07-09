const timer = document.getElementById('timer');

var hr = 0;
var min = 5;
var sec = 0;
var stoptime = true;

function startTimer(mins) {
    if(mins)min = mins;
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

        sec = sec - 1;

        if (sec == -1) {
            min = min - 1;
            sec = 59;
        }
        if (min == -1) {
            hr = hr - 1;
            if(hr==-1)hr=0;
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

        timer.innerHTML = hr + ':' + min + ':' + sec;

        setTimeout("timerCycle()", 1000);
    }
}

function resetTimer(min) {
    if (min<10)min='0'+min;
    timer.innerHTML = '00:'+min+':00';
    stoptime = true;
    hr = 0;
    sec = 0;
    min = 0;
}