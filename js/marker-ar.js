"use strict";

/*
=========================================================
HERITAGE AR GUIDE
Marker-Based AR Controller
=========================================================

Features:

1. Marker detection
2. Buddha / Casket selection
3. Rotate left
4. Rotate right
5. Scale up
6. Scale down
7. Reset artifact
8. Remove artifact
9. Add artifact again
10. Information panel
11. Loading/error handling
=========================================================
*/


/* =======================================================
   GET HTML ELEMENTS
   ======================================================= */

const target = document.querySelector("#target");

const artifact = document.querySelector("#artifact");

const statusText = document.querySelector("#status");

const buddhaButton = document.querySelector("#buddha-button");

const casketButton = document.querySelector("#casket-button");

const rotateLeftButton = document.querySelector("#rotate-left");

const rotateRightButton = document.querySelector("#rotate-right");

const scaleDownButton = document.querySelector("#scale-down");

const scaleUpButton = document.querySelector("#scale-up");

const resetButton = document.querySelector("#reset-object");

const removeButton = document.querySelector("#remove-object");

const showButton = document.querySelector("#show-object");

const infoButton = document.querySelector("#info-button");

const closeInfoButton = document.querySelector("#close-info");

const infoPanel = document.querySelector("#info-panel");

const infoTitle = document.querySelector("#info-title");

const infoDescription = document.querySelector("#info-description");

const backButton = document.querySelector("#back-button");


/* =======================================================
   APPLICATION STATE
   ======================================================= */

let selectedArtifact = "buddha";

let artifactVisible = true;

let markerDetected = false;


/*
Default transformation values.

These values are restored when
the user presses RESET.
*/

const defaultTransform = {

  position: {
    x: 0,
    y: 0,
    z: 0
  },

  rotation: {
    x: 0,
    y: 0,
    z: 0
  },

  scale: 0.5

};


/*
Current rotation.
*/

let rotationY = 0;


/*
Current scale.
*/

let currentScale = defaultTransform.scale;


/* =======================================================
   ARTIFACT INFORMATION
   ======================================================= */

const artifactInformation = {

  buddha: {

    title: "Head of Buddha Statue",

    description:
      "This 3D artifact represents a Buddha statue from Sri Lankan cultural heritage. " +
      "The model allows visitors to explore the artifact interactively using augmented reality."

  },

  casket: {

    title: "Coral Relic Casket",

    description:
      "This artifact represents a traditional relic casket associated with Sri Lankan heritage. " +
      "In this AR experience, the casket can be selected, rotated, resized and removed."

  }

};


/* =======================================================
   STATUS MESSAGE
   ======================================================= */

function setStatus(message) {

  if (statusText) {

    statusText.textContent = message;

  }

}


function centerLoadedModel() {

  const model =
    artifact.object3D.children[0];

  if (!model) {

    return;

  }


  const bounds =
    new THREE.Box3();

  model.traverse(
    (node) => {

      if (!node.isMesh) {

        return;

      }


      node.geometry.computeBoundingBox();

      bounds.union(
        node.geometry.boundingBox.clone()
          .applyMatrix4(node.matrix)
      );

    }
  );


  if (bounds.isEmpty()) {

    return;

  }

  const center =
    bounds.getCenter(
      new THREE.Vector3()
    );


  model.position.x -=
    center.x;

  model.position.y -=
    bounds.min.y;

  model.position.z -=
    center.z;

}


/* =======================================================
   UPDATE BUTTON STATES
   ======================================================= */

function updateArtifactButtons() {

  /*
  Remove active class from both buttons.
  */

  buddhaButton.classList.remove("active");

  casketButton.classList.remove("active");


  /*
  Add active class to selected artifact.
  */

  if (selectedArtifact === "buddha") {

    buddhaButton.classList.add("active");

  }

  else {

    casketButton.classList.add("active");

  }

}


/* =======================================================
   SELECT BUDDHA
   ======================================================= */

function selectBuddha() {

  selectedArtifact = "buddha";

  /*
  Change GLB model.
  */

  artifact.setAttribute(
    "gltf-model",
    "models/head_of_buddha_statue.glb"
  );


  /*
  Reset transformation.
  */

  resetArtifact(false);


  /*
  Update UI.
  */

  updateArtifactButtons();

  updateInformation();

  artifactVisible = true;

  artifact.setAttribute("visible", true);

  setStatus("Buddha artifact selected");

}


/* =======================================================
   SELECT CASKET
   ======================================================= */

function selectCasket() {

  selectedArtifact = "casket";

  /*
  Change GLB model.
  */

  artifact.setAttribute(
    "gltf-model",
    "models/coral_relic_casket.glb"
  );


  /*
  Reset transformation.
  */

  resetArtifact(false);


  /*
  Update UI.
  */

  updateArtifactButtons();

  updateInformation();

  artifactVisible = true;

  artifact.setAttribute("visible", true);

  setStatus("Casket artifact selected");

}


/* =======================================================
   ROTATE LEFT
   ======================================================= */

function rotateLeft() {

  rotationY -= 15;

  artifact.setAttribute(
    "rotation",
    `0 ${rotationY} 0`
  );

  setStatus("Rotated left");

}


/* =======================================================
   ROTATE RIGHT
   ======================================================= */

function rotateRight() {

  rotationY += 15;

  artifact.setAttribute(
    "rotation",
    `0 ${rotationY} 0`
  );

  setStatus("Rotated right");

}


/* =======================================================
   SCALE DOWN
   ======================================================= */

function scaleDown() {

  currentScale -= 0.05;


  /*
  Prevent the model from becoming
  too small.
  */

  if (currentScale < 0.1) {

    currentScale = 0.1;

  }


  setArtifactScale();

  setStatus("Artifact made smaller");

}


/* =======================================================
   SCALE UP
   ======================================================= */

function scaleUp() {

  currentScale += 0.05;


  /*
  Prevent the model from
  becoming excessively large.
  */

  if (currentScale > 1.5) {

    currentScale = 1.5;

  }


  setArtifactScale();

  setStatus("Artifact made larger");

}


/* =======================================================
   APPLY SCALE
   ======================================================= */

function setArtifactScale() {

  artifact.setAttribute(
    "scale",
    `${currentScale} ${currentScale} ${currentScale}`
  );

}


/* =======================================================
   RESET ARTIFACT
   ======================================================= */

function resetArtifact(showStatus = true) {

  /*
  Reset position.
  */

  artifact.setAttribute(
    "position",
    "0 0 0"
  );


  /*
  Reset rotation.
  */

  rotationY = 0;

  artifact.setAttribute(
    "rotation",
    "0 0 0"
  );


  /*
  Reset scale.
  */

  currentScale = defaultTransform.scale;

  setArtifactScale();


  /*
  Make artifact visible.
  */

  artifactVisible = true;

  artifact.setAttribute(
    "visible",
    true
  );


  /*
  Update button.
  */

  removeButton.style.display = "inline-flex";

  showButton.style.display = "none";


  if (showStatus) {

    setStatus("Artifact reset");

  }

}


/* =======================================================
   REMOVE ARTIFACT
   ======================================================= */

function removeArtifact() {

  artifactVisible = false;

  artifact.setAttribute(
    "visible",
    false
  );


  /*
  Hide remove button.
  */

  removeButton.style.display = "none";


  /*
  Show add button.
  */

  showButton.style.display = "inline-flex";


  setStatus(
    "Artifact removed. Tap Add Artifact to restore it."
  );

}


/* =======================================================
   SHOW ARTIFACT
   ======================================================= */

function showArtifact() {

  artifactVisible = true;

  artifact.setAttribute(
    "visible",
    true
  );


  /*
  Hide add button.
  */

  showButton.style.display = "none";


  /*
  Show remove button.
  */

  removeButton.style.display = "inline-flex";


  setStatus("Artifact added again");

}


/* =======================================================
   UPDATE INFORMATION
   ======================================================= */

function updateInformation() {

  const information =
    artifactInformation[selectedArtifact];


  infoTitle.textContent =
    information.title;


  infoDescription.textContent =
    information.description;

}


/* =======================================================
   OPEN INFORMATION PANEL
   ======================================================= */

function openInformation() {

  updateInformation();

  infoPanel.classList.add("visible");

}


/* =======================================================
   CLOSE INFORMATION PANEL
   ======================================================= */

function closeInformation() {

  infoPanel.classList.remove("visible");

}


/* =======================================================
   MARKER FOUND
   ======================================================= */

target.addEventListener(
  "targetFound",
  () => {

    markerDetected = true;

    setStatus(
      "Marker detected ✓ Artifact ready"
    );


    /*
    If the artifact has not been removed,
    make sure it is visible.
    */

    if (artifactVisible) {

      artifact.setAttribute(
        "visible",
        true
      );

    }

  }
);


/* =======================================================
   MARKER LOST
   ======================================================= */

target.addEventListener(
  "targetLost",
  () => {

    markerDetected = false;

    setStatus(
      "Marker lost — point camera at the marker"
    );

  }
);


/* =======================================================
   MODEL LOADED
   ======================================================= */

artifact.addEventListener(
  "model-loaded",
  () => {

    requestAnimationFrame(
      () => {

        requestAnimationFrame(
          centerLoadedModel
        );

      }
    );

    console.log(
      "3D artifact loaded successfully."
    );

    setStatus(
      "3D artifact loaded successfully ✓"
    );

  }
);


/* =======================================================
   MODEL ERROR
   ======================================================= */

artifact.addEventListener(
  "model-error",
  (event) => {

    console.error(
      "Failed to load 3D artifact:",
      event
    );

    setStatus(
      "Error loading 3D artifact"
    );

  }
);


/* =======================================================
   BUTTON EVENTS
   ======================================================= */

buddhaButton.addEventListener(
  "click",
  selectBuddha
);


casketButton.addEventListener(
  "click",
  selectCasket
);


rotateLeftButton.addEventListener(
  "click",
  rotateLeft
);


rotateRightButton.addEventListener(
  "click",
  rotateRight
);


scaleDownButton.addEventListener(
  "click",
  scaleDown
);


scaleUpButton.addEventListener(
  "click",
  scaleUp
);


resetButton.addEventListener(
  "click",
  () => resetArtifact(true)
);


removeButton.addEventListener(
  "click",
  removeArtifact
);


showButton.addEventListener(
  "click",
  showArtifact
);


infoButton.addEventListener(
  "click",
  openInformation
);


closeInfoButton.addEventListener(
  "click",
  closeInformation
);


/* =======================================================
   BACK BUTTON
   ======================================================= */

backButton.addEventListener(
  "click",
  () => {

    window.location.href = "index.html";

  }
);


/* =======================================================
   INITIALIZE
   ======================================================= */

updateArtifactButtons();

updateInformation();

setArtifactScale();


console.log(
  "Heritage AR Marker Controller initialized."
);