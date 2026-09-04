"use strict";


const statusElement =
    document.getElementById("status");

const targetElement =
    document.getElementById("target");

const artifactElement =
    document.getElementById("artifact");

const infoButton =
    document.getElementById("info-button");

const closeInfoButton =
    document.getElementById("close-info");

const infoPanel =
    document.getElementById("info-panel");


/*
    Model loaded successfully
*/

artifactElement.addEventListener(
    "model-loaded",
    () => {

        console.log(
            "3D model loaded successfully"
        );

        statusElement.textContent =
            "Model loaded. Point your camera at the Moonstone marker.";

    }
);


/*
    Model loading error
*/

artifactElement.addEventListener(
    "model-error",
    (event) => {

        console.error(
            "Model loading error:",
            event
        );

        statusElement.textContent =
            "The 3D model could not be loaded.";

    }
);


/*
    Marker found
*/

targetElement.addEventListener(
    "targetFound",
    () => {

        console.log(
            "Marker detected"
        );

        statusElement.textContent =
            "Marker detected! The artifact should now appear.";

    }
);


/*
    Marker lost
*/

targetElement.addEventListener(
    "targetLost",
    () => {

        console.log(
            "Marker lost"
        );

        statusElement.textContent =
            "Marker lost. Point your camera at the Moonstone marker.";

    }
);


/*
    Open information panel
*/

infoButton.addEventListener(
    "click",
    () => {

        infoPanel.classList.add(
            "visible"
        );

    }
);


/*
    Close information panel
*/

closeInfoButton.addEventListener(
    "click",
    () => {

        infoPanel.classList.remove(
            "visible"
        );

    }
);