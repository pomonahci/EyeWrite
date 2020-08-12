# [EyeWrite](https://hci.pomona.edu/EyeWrite)

EyeWrite is an online collaborative text editor which utilizes eye tracking to share each user's gaze with their collaborators and visualize them in real time on the working document. EyeWrite uses WebGazer.js for eye tracking capabilities as well as CodeMirror and Firepad for rich-text editing and real time collaboration. EyeWrite functions completely on the browser and uses the everyday webcam for eye tracking, providing an easily accessible environment for close collaboration. EyeWrite also is capable of visualizing each collaborator's mouse movement instead of their gaze. The webcam can only be accessed for gaze sharing with the user's consent and once EyeWrite is in use, the sharing of gaze and mouse data with collaborators can be toggled on and off at the user's discretion.

## Features

    *Rich-text editing with version history
    *Real-time collaboration with user gaze and mouse location sharing
    *Arbitrary number of users
    *Uses common webcam for eye tracking
    *Eye tracking is self-calibrating
    *Optional manual calibration page
    *Option to block the sharing of gaze and mouse data

## Build the repository

If you want to build the repository from source follow these instructions:

    # Ensure NodeJS is downloaded: https://nodejs.org/en/download/
    git clone https://github.com/pomonahci/EyeWrite.git
    cd EyeWrite
    npm install
    # build dependencies for WebGazer
    cd node_modules
    cd webgazer
    npm install
    # build dependencies for calibration page
    cd www
    npm install

## Run EyeWrite locally

    # Ensure you are in the EyeWrite directory
    cd
    cd EyeWrite
    # Run index.js with NodeJS
    node index.js

    *Visit (http://localhost:3000) on your browser
    *Follow the instructions on the welcome page to create or join a collaborative document



