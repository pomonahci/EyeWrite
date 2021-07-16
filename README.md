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

## Running EyeWrite locally

    # Make sure you installed browser-sync globally
    npm i -g browser-sync
    # Then, run the following script.
    npm start

* Visit (http://localhost:3000) on your browser
* Follow the instructions on the welcome page to create or join a collaborative document.

## Running Experiments through the URL
When creating the URL, just make sure these tags are included anywhere (except for prm) in the URL verbatim as you see here:
Visualization Triggers:
- vis=0 no visualization
- vis=1 hollow circle
- vis=2 heatmap
Audio Triggers
- aud=0 no audio call
- aud=1 audio call on
Prompt Triggers (THIS MUST BE THE LAST TAG IN THE URL)
- prm="stringOfYourChoiceHere"
Number of Participants Trigger (default is 2 if none is passed)
- par=1 
- par=2
- etc
Radius of Visualization
- rad=x (radius of x)