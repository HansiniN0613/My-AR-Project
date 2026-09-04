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


let markerVisible = false;


/*
    Automatically scale and center
    the loaded GLB model.
*/

artifactElement.addEventListener(
    "model-loaded",
    (event) => {

        const model =
            event.detail.model;


        const box =
            new THREE.Box3()
                .setFromObject(model);


        const size =
            box.getSize(
                new THREE.Vector3()
            );


        const center =
            box.getCenter(
                new THREE.Vector3()
            );


        const largestDimension =
            Math.max(
                size.x,
                size.y,
                size.z
            );


        if (
            largestDimension > 0
        ) {

            const targetSize =
                1.0;


            const scale =
                targetSize /
                largestDimension;


            model.scale.multiplyScalar(
                scale
            );

        }


        /*
            Center the model around
            its origin.
        */

        model.position.sub(center);


        statusElement.textContent =
            "Model loaded. Scan the Moonstone marker.";

    }
);


/*
    Marker found
*/

targetElement.addEventListener(
    "targetFound",
    () => {

        markerVisible = true;

        statusElement.textContent =
            "Marker detected! Explore the 3D artifact.";

    }
);


/*
    Marker lost
*/

targetElement.addEventListener(
    "targetLost",
    () => {

        markerVisible = false;

        statusElement.textContent =
            "Marker lost. Point your camera at the Moonstone marker.";

    }
);


/*
    Information panel
*/

infoButton.addEventListener(
    "click",
    () => {

        infoPanel.classList.add(
            "visible"
        );

    }
);


closeInfoButton.addEventListener(
    "click",
    () => {

        infoPanel.classList.remove(
            "visible"
        );

    }
);


/*
    Basic load error handling
*/

artifactElement.addEventListener(
    "model-error",
    () => {

        statusElement.textContent =
            "The 3D model could not be loaded. Please check the model file.";

    }
);