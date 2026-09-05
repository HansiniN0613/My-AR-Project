import * as THREE from "three";

import { GLTFLoader } from
"three/addons/loaders/GLTFLoader.js";

"use strict";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const statusElement =
    document.getElementById("status");

const startButton =
    document.getElementById("start-ar");


const artifactButtons = {

    buddha:
        document.getElementById(
            "buddha-button"
        ),

    casket:
        document.getElementById(
            "casket-button"
        )

};


const rotateLeftButton =
    document.getElementById(
        "rotate-left"
    );


const rotateRightButton =
    document.getElementById(
        "rotate-right"
    );


const scaleDownButton =
    document.getElementById(
        "scale-down"
    );


const scaleUpButton =
    document.getElementById(
        "scale-up"
    );


const removeButton =
    document.getElementById(
        "remove-object"
    );


const hud =
    document.getElementById("hud");


/* =========================================================
   ARTIFACT CONFIGURATION
========================================================= */

const artifactPaths = {

    buddha:
        "models/head_of_buddha_statue.glb",

    casket:
        "models/coral_relic_casket.glb"

};


let selectedArtifact =
    "buddha";


let placedModel =
    null;


let placingModel =
    false;


/* =========================================================
   THREE.JS SETUP
========================================================= */

const scene =
    new THREE.Scene();


const camera =
    new THREE.PerspectiveCamera(
        70,
        window.innerWidth /
        window.innerHeight,
        0.01,
        20
    );


const renderer =
    new THREE.WebGLRenderer({

        antialias: true,

        alpha: true

    });


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.xr.enabled =
    true;


renderer.xr.setReferenceSpaceType(
    "local"
);


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


document.body.appendChild(
    renderer.domElement
);


/* =========================================================
   LIGHTING
========================================================= */

const hemisphereLight =
    new THREE.HemisphereLight(
        0xffffff,
        0x443322,
        2
    );


scene.add(
    hemisphereLight
);


const directionalLight =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );


directionalLight.position.set(
    2,
    4,
    2
);


scene.add(
    directionalLight
);


/* =========================================================
   RETICLE
========================================================= */

const reticleGeometry =
    new THREE.RingGeometry(
        0.06,
        0.09,
        32
    );


reticleGeometry.rotateX(
    -Math.PI / 2
);


const reticleMaterial =
    new THREE.MeshBasicMaterial({

        color:
            0xd99a4e

    });


const reticle =
    new THREE.Mesh(
        reticleGeometry,
        reticleMaterial
    );


reticle.matrixAutoUpdate =
    false;


reticle.visible =
    false;


scene.add(
    reticle
);


/* =========================================================
   MODEL LOADING
========================================================= */

const loader =
    new GLTFLoader();


const loadedModels =
    new Map();


function setStatus(message) {

    statusElement.textContent =
        message;

}


/*
    Normalize model size and
    center the model.
*/

function prepareModel(model) {

    const box =
        new THREE.Box3()
            .setFromObject(
                model
            );


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
            0.35;


        const scale =
            targetSize /
            largestDimension;


        model.scale.setScalar(
            scale
        );

    }


    /*
        Center model horizontally.
    */

    model.position.x -=
        center.x;

    model.position.z -=
        center.z;


    /*
        Place model on surface.
    */

    model.position.y -=
        box.min.y;


    return model;

}


function cloneModel(
    original
) {

    const clone =
        original.clone(
            true
        );


    clone.userData.baseScale =
        clone.scale.x;


    return clone;

}


function loadArtifact(name) {

    if (
        loadedModels.has(name)
    ) {

        return Promise.resolve(
            cloneModel(
                loadedModels.get(name)
            )
        );

    }


    setStatus(
        `Loading ${
            name === "buddha"
                ? "Buddha statue"
                : "Coral relic casket"
        }...`
    );


    return new Promise(
        (
            resolve,
            reject
        ) => {

            loader.load(

                artifactPaths[name],


                (gltf) => {

                    const model =
                        prepareModel(
                            gltf.scene
                        );


                    loadedModels.set(
                        name,
                        model
                    );


                    resolve(
                        cloneModel(
                            model
                        )
                    );

                },


                undefined,


                (error) => {

                    reject(
                        error
                    );

                }

            );

        }
    );

}


/* =========================================================
   ARTIFACT SELECTION
========================================================= */

async function selectArtifact(
    name
) {

    selectedArtifact =
        name;


    artifactButtons.buddha
        .classList.toggle(
            "active",
            name === "buddha"
        );


    artifactButtons.casket
        .classList.toggle(
            "active",
            name === "casket"
        );


    /*
        If no object has been placed,
        only change the next object.
    */

    if (
        !placedModel
    ) {

        setStatus(
            "Artifact selected. Find a surface and tap to place it."
        );


        return;

    }


    try {

        const replacement =
            await loadArtifact(
                name
            );


        /*
            Preserve position and rotation.
        */

        replacement.position.copy(
            placedModel.position
        );


        replacement.rotation.copy(
            placedModel.rotation
        );


        scene.remove(
            placedModel
        );


        placedModel =
            replacement;


        scene.add(
            placedModel
        );


        setStatus(
            "Artifact changed successfully."
        );

    }

    catch (
        error
    ) {

        console.error(
            error
        );


        setStatus(
            "Unable to load the selected artifact."
        );

    }

}


/* =========================================================
   PLACE ARTIFACT
========================================================= */

async function placeArtifact() {

    if (
        !reticle.visible ||
        placingModel
    ) {

        return;

    }


    placingModel =
        true;


    try {

        const model =
            await loadArtifact(
                selectedArtifact
            );


        if (
            placedModel
        ) {

            scene.remove(
                placedModel
            );

        }


        model.position.setFromMatrixPosition(
            reticle.matrix
        );


        placedModel =
            model;


        scene.add(
            placedModel
        );


        setStatus(
            "Artifact placed. Use the controls to rotate, scale, change, or remove it."
        );

    }

    catch (
        error
    ) {

        console.error(
            error
        );


        setStatus(
            "The 3D model could not be loaded."
        );

    }

    finally {

        placingModel =
            false;

    }

}


/* =========================================================
   HIT TEST
========================================================= */

let hitTestSource =
    null;


let hitTestSourceRequested =
    false;


function requestHitTestSource(
    session
) {

    session
        .requestReferenceSpace(
            "viewer"
        )

        .then(
            (
                referenceSpace
            ) => {

                return session
                    .requestHitTestSource({

                        space:
                            referenceSpace

                    });

            }
        )

        .then(
            (
                source
            ) => {

                hitTestSource =
                    source;

            }
        )

        .catch(
            (
                error
            ) => {

                console.error(
                    error
                );


                setStatus(
                    "Unable to initialize surface detection."
                );

            }
        );

}


function resetARSession() {

    if (
        hitTestSource
    ) {

        hitTestSource.cancel();

    }


    hitTestSource =
        null;


    hitTestSourceRequested =
        false;


    reticle.visible =
        false;


    startButton.disabled =
        false;


    startButton.textContent =
        "Start AR";


    setStatus(
        "AR session ended. Tap Start AR to begin again."
    );

}


/* =========================================================
   RENDER LOOP
========================================================= */

function render(
    timestamp,
    frame
) {

    if (
        frame
    ) {

        const session =
            renderer.xr.getSession();


        if (
            session &&
            !hitTestSourceRequested
        ) {

            requestHitTestSource(
                session
            );


            hitTestSourceRequested =
                true;

        }


        if (
            hitTestSource
        ) {

            const referenceSpace =
                renderer.xr
                    .getReferenceSpace();


            const results =
                frame.getHitTestResults(
                    hitTestSource
                );


            if (
                results.length > 0
            ) {

                const pose =
                    results[0]
                        .getPose(
                            referenceSpace
                        );


                if (
                    pose
                ) {

                    reticle.visible =
                        true;


                    reticle.matrix
                        .fromArray(
                            pose.transform.matrix
                        );


                    if (
                        !placedModel
                    ) {

                        setStatus(
                            "Surface detected. Tap the camera view to place the artifact."
                        );

                    }

                }

            }

            else {

                reticle.visible =
                    false;


                if (
                    !placedModel
                ) {

                    setStatus(
                        "Move your phone slowly to find a flat surface."
                    );

                }

            }

        }

    }


    renderer.render(
        scene,
        camera
    );

}


renderer.setAnimationLoop(
    render
);


/* =========================================================
   START WEBXR AR
========================================================= */

async function startAR() {

    /*
        Security requirement.
    */

    if (
        !window.isSecureContext
    ) {

        setStatus(
            "AR requires HTTPS. Deploy the project using GitHub Pages before testing on your phone."
        );


        return;

    }


    if (
        !navigator.xr
    ) {

        setStatus(
            "WebXR is unavailable. Use a recent version of Google Chrome on a compatible Android device."
        );


        return;

    }


    try {

        const supported =
            await navigator.xr
                .isSessionSupported(
                    "immersive-ar"
                );


        if (
            !supported
        ) {

            setStatus(
                "This device does not support immersive WebXR AR."
            );


            return;

        }


        if (
            renderer.xr.getSession()
        ) {

            return;

        }


        const session =
            await navigator.xr
                .requestSession(

                    "immersive-ar",

                    {

                        requiredFeatures: [

                            "hit-test"

                        ],


                        optionalFeatures: [

                            "dom-overlay",

                            "local-floor"

                        ],


                        domOverlay: {

                            root:
                                hud

                        }

                    }

                );


        session.addEventListener(

            "end",

            resetARSession,

            {

                once:
                    true

            }

        );


        await renderer.xr
            .setSession(
                session
            );


        startButton.disabled =
            true;


        startButton.textContent =
            "AR Running";


        setStatus(
            "Move your phone slowly to detect a flat surface."
        );

    }

    catch (
        error
    ) {

        console.error(
            error
        );


        setStatus(
            "Unable to start AR. Check Chrome, HTTPS, camera permission, and AR support."
        );

    }

}


startButton.addEventListener(

    "click",

    startAR

);


/* =========================================================
   COMPLEX INTERACTION
========================================================= */

rotateLeftButton
    .addEventListener(

        "click",

        () => {

            if (
                placedModel
            ) {

                placedModel.rotation.y +=
                    THREE.MathUtils
                        .degToRad(
                            15
                        );

            }

        }

    );


rotateRightButton
    .addEventListener(

        "click",

        () => {

            if (
                placedModel
            ) {

                placedModel.rotation.y -=
                    THREE.MathUtils
                        .degToRad(
                            15
                        );

            }

        }

    );


scaleDownButton
    .addEventListener(

        "click",

        () => {

            if (
                placedModel
            ) {

                const currentScale =
                    placedModel.scale.x;


                const minimumScale =
                    placedModel.userData
                        .baseScale *
                    0.5;


                const newScale =
                    Math.max(

                        minimumScale,

                        currentScale *
                        0.9

                    );


                placedModel.scale
                    .setScalar(
                        newScale
                    );

            }

        }

    );


scaleUpButton
    .addEventListener(

        "click",

        () => {

            if (
                placedModel
            ) {

                const currentScale =
                    placedModel.scale.x;


                const maximumScale =
                    placedModel.userData
                        .baseScale *
                    2.5;


                const newScale =
                    Math.min(

                        maximumScale,

                        currentScale *
                        1.1

                    );


                placedModel.scale
                    .setScalar(
                        newScale
                    );

            }

        }

    );


removeButton
    .addEventListener(

        "click",

        () => {

            if (
                placedModel
            ) {

                scene.remove(
                    placedModel
                );


                placedModel =
                    null;


                setStatus(
                    "Artifact removed. Find a surface and tap to place another artifact."
                );

            }

        }

    );


/* =========================================================
   USER TAP TO PLACE
========================================================= */

renderer.domElement
    .addEventListener(

        "pointerdown",

        placeArtifact

    );


/* =========================================================
   WINDOW RESIZE
========================================================= */

window.addEventListener(

    "resize",

    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }

);