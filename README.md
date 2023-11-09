# [EyeWrite](https://hci.pomona.edu/EyeWrite)

## Description

EyeWrite is an online collaborative text editor which utilizes eye tracking to share each user's gaze with their collaborators and visualize them in real time on the working document. EyeWrite uses WebGazer.js for eye tracking capabilities as well as CodeMirror and Firepad for rich-text editing and real time collaboration. EyeWrite functions completely on the browser and uses the everyday webcam for eye tracking, providing an easily accessible environment for close collaboration. EyeWrite also is capable of visualizing each collaborator's mouse movement instead of their gaze. The webcam can only be accessed for gaze sharing with the user's consent and once EyeWrite is in use, the sharing of gaze and mouse data with collaborators can be toggled on and off at the user's discretion.

## Features

* Rich-text editing with version history
* Real-time collaboration with user gaze and mouse location sharing
* Arbitrary number of users
* Uses common webcam for eye tracking
* Eye tracking is self-calibrating
* Optional manual calibration page
* Option to block the sharing of gaze and mouse data
* Option to alter visualization.js to use an external eye tracker 
* WebRTC-based voice chat for optional audio communication
* Option to customize visualizations (highlight pattern and size)

## Building the Source Code

If you want to build the source code from this repository, please follow these instructions:

    # Ensure NodeJS is downloaded: https://nodejs.org/en/download/
    git clone https://github.com/pomonahci/EyeWrite.git
    cd EyeWrite
    npm install
    # build dependencies for WebGazer
    cd node_modules/webgazer
    npm install

Note: you may need to import WebGazer module from hci.pomona server

For the Tobii integration, we need to browserify `tobii.js`, because it uses Node modules. To do this:

    npm install -g browserify
    cd EyeWrite
    npm install  # we need all node packages installed
    cd scripts
    browserify tobii.js -o bundle.js

## Running EyeWrite locally

    # Make sure you installed browser-sync globally
    npm i -g browser-sync
    # Then, run the following script.
    npm start

* Run TobiiServer/TobiiElectronServer.exe
* Visit (http://localhost:3000) on your browser
* Follow the instructions on the welcome page to create or join a collaborative document.
* Make sure that, if you're in room 219, you set the resolution to be 2560 by 1440, and restart the computer.

## Running Experiments through the URL
When creating the URL, just make sure these tags are included anywhere in the URL verbatim as you see here:

Visualization Triggers:

  * [ ] In the URL, specify `vis=xxxx`. Note that if you do *not* want the gaze visualization but you still want to track gaze and overlap data, you should set `vis=1020`.

| Place  | is 0                      | is 1                         | is 2                       |
|:-------|:--------------------------|:-----------------------------|:---------------------------|
| vis[0] | No gaze data              | Yes gaze data                |                            |
| vis[1] | Hollow gaze visualization | Solid gaze visualization     | Heatmap gaze visualization |
| vis[2] | All users same colors     | Unique visualizations        | Transparent visualizations |
| vis[3] | No overlap color change   | Deterministic overlap colors | Combination overlap colors |


Audio Triggers
- aud=0 no audio call
- aud=1 audio call on

Image Triggers
- img=0 father's day
- img=1 christmas
- img=2 horse
- img=3 warmup

Number of Participants Trigger (default is 2 if none is passed)
- par=1 
- par=2
- etc

Radius of Visualization
The radius is a *two digit number*. We multiply this by 8 to get the radius of the circle visualization in pixels (for the Hollow and Solid cases, and invisibly in the Transparent case). So, for example, if you have `rad=10`, then we will get a circle with radius `8 * 10 = 80` pixels (including the 5px border). So the diameter of the circle will be 160 pixels.

If you want a radius smaller than 80 pixels (that is, a one-digit radius), you must have a leading `0`. For example, `rad=05` will get you a radius of `8 * 5 = 40` pixels, for a circle with diameter 80 pixels.
