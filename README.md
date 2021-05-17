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

## Development Guide

### Intro to EyeWrite UI
* Left Panel: User list, visualization control, and audio toggles.
* Main Panel: Rich Text Editor (Firepad, Code Mirror) with toolbar at the top.

### Code Organization
| Content                       | Location                                                      |
| ----------------------------- | ------------------------------------------------------------- |
| home page                     | index.html                                                    |
| document page                 | eyewrite.html                                                 |
| server file (for development) | index.js                                                      |
| basic UI styling/adjustments  | css (for stylesheets), scripts/ui-adjustments.js              |
| visualization control/toggles | scripts/visualization-control.js                              |
| voice chat functions          | scripts/voice-chat.js                                         |
| highlight styling             | scripts/highlight-styles.js, scripts/visualization-control.js |

Note: any changes made in the javascript files will likely require changes in the html files.

### Building the Source Code

If you want to build the source code from this repository, please follow these instructions:

    # Ensure NodeJS is downloaded: https://nodejs.org/en/download/
    git clone https://github.com/pomonahci/EyeWrite.git
    cd EyeWrite
    npm install
    # build dependencies for WebGazer
    cd node_modules/webgazer
    npm install

Note: you may need to import WebGazer module from hci.pomona server

### Running EyeWrite locally

    # Make sure that port 3000 on localhost is open.
    # Then, run the following script.
    `npm start`

* Visit (http://localhost:3000) on your browser
* Follow the instructions on the welcome page to create or join a collaborative document

### Deploying
* Push changes to GitHub repo.
* Log into the HCI server (requires a VPN connection), go to the project folder in the web directory, and pull changes.