/**
 * stopwatch.js defines a stopwatch feature to be placed in a div element
 *
 * Name: nickmarsano
 * Date: 7/23/21
 */

const stopwatch = document.getElementById('stopwatch');

let hr = 0;
let min = 0;
let sec = 0;
let stoptime = true;
let timer;

function startStopwatch() {
  if (stoptime) {
    stoptime = false;
    stopwatchCycle();
  }
}

function stopStopwatch() {
  stoptime = true;
  clearTimeout(timer);
}

function stopwatchCycle() {
  if (!stoptime) {
    sec = parseInt(sec);
    min = parseInt(min);
    hr = parseInt(hr);

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

    if (sec < 10) sec = '0' + sec;
    if (min < 10) min = '0' + min;
    if (hr < 10) hr = '0' + hr;

    stopwatch.innerHTML = hr + ':' + min + ':' + sec;

    timer = setTimeout(stopwatchCycle, 1000);
  }
}

function resetStopwatch() {
  stopStopwatch();
  stopwatch.innerHTML = '00:00:00';
  hr = 0;
  sec = 0;
  min = 0;
}