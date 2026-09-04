import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const statusElement = document.getElementById("status");
const startButton = document.getElementById("start-ar");
const artifactButtons = {
    buddha: document.getElementById("buddha-button"),
    casket: document.getElementById("casket-button")
};
const artifactPaths = {
    buddha: "models/head_of_buddha_statue.glb",
    casket: "models/coral_relic_casket.glb"
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType("local");
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x554433, 3));
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(2, 4, 2);
scene.add(directionalLight);

const reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.08, 0.1, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xd99a4e })
);
reticle.matrixAutoUpdate = false;
reticle.visible = false;
scene.add(reticle);

const loader = new GLTFLoader();
const loadedModels = new Map();
let selectedArtifact = "buddha";
let placedModel = null;
let hitTestSource = null;
let hitTestSourceRequested = false;

function setStatus(message) {
    statusElement.textContent = message;
}

function prepareModel(model) {
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z);
    if (largestDimension > 0) {
        model.scale.setScalar(0.25 / largestDimension);
    }
    return model;
}

function loadArtifact(name) {
    if (loadedModels.has(name)) {
        return Promise.resolve(loadedModels.get(name).clone());
    }

    setStatus(`Loading ${name === "buddha" ? "Buddha statue" : "coral casket"}...`);
    return new Promise((resolve, reject) => {
        loader.load(artifactPaths[name], (gltf) => {
            const model = prepareModel(gltf.scene);
            loadedModels.set(name, model);
            resolve(model.clone());
        }, undefined, reject);
    });
}

async function selectArtifact(name) {
    selectedArtifact = name;
    artifactButtons.buddha.classList.toggle("active", name === "buddha");
    artifactButtons.casket.classList.toggle("active", name === "casket");

    if (!placedModel) {
        setStatus("Move your phone until a flat surface is detected, then tap the screen.");
        return;
    }

    try {
        const replacement = await loadArtifact(name);
        replacement.position.copy(placedModel.position);
        replacement.rotation.copy(placedModel.rotation);
        replacement.scale.copy(placedModel.scale);
        scene.remove(placedModel);
        placedModel = replacement;
        scene.add(placedModel);
        setStatus("Artifact changed. Use the controls to explore it.");
    } catch (error) {
        setStatus("The selected 3D model could not be loaded.");
        console.error(error);
    }
}

function placeArtifact() {
    if (!reticle.visible) {
        return;
    }

    loadArtifact(selectedArtifact).then((model) => {
        if (placedModel) {
            scene.remove(placedModel);
        }
        model.position.setFromMatrixPosition(reticle.matrix);
        placedModel = model;
        scene.add(placedModel);
        setStatus("Artifact placed. Use the controls to explore it.");
    }).catch((error) => {
        setStatus("The 3D model could not be loaded. Check the model path and tunnel connection.");
        console.error(error);
    });
}

function requestHitTestSource(session) {
    session.requestReferenceSpace("viewer").then((referenceSpace) => {
        session.requestHitTestSource({ space: referenceSpace }).then((source) => {
            hitTestSource = source;
        });
    });
    session.addEventListener("end", () => {
        hitTestSourceRequested = false;
        hitTestSource = null;
        reticle.visible = false;
        startButton.disabled = false;
        startButton.textContent = "Start AR";
        setStatus("AR ended. Tap Start AR to begin again.");
    }, { once: true });
}

function render(timestamp, frame) {
    if (frame) {
        const session = renderer.xr.getSession();
        if (!hitTestSourceRequested) {
            requestHitTestSource(session);
            hitTestSourceRequested = true;
        }

        if (hitTestSource) {
            const referenceSpace = renderer.xr.getReferenceSpace();
            const hitTestResults = frame.getHitTestResults(hitTestSource);
            if (hitTestResults.length > 0) {
                const pose = hitTestResults[0].getPose(referenceSpace);
                reticle.visible = true;
                reticle.matrix.fromArray(pose.transform.matrix);
                if (!placedModel) {
                    setStatus("Surface found. Tap the screen to place the artifact.");
                }
            } else {
                reticle.visible = false;
                if (!placedModel) {
                    setStatus("Move your phone slowly to find a flat surface.");
                }
            }
        }
    }
    renderer.render(scene, camera);
}

async function startAR() {
    if (!navigator.xr) {
        setStatus("WebXR AR is not available. Use recent Android Chrome over HTTPS.");
        return;
    }

    try {
        const supported = await navigator.xr.isSessionSupported("immersive-ar");
        if (!supported) {
            setStatus("This phone or browser does not support immersive AR.");
            return;
        }
        if (renderer.xr.getSession()) {
            return;
        }
        const session = await navigator.xr.requestSession("immersive-ar", {
            requiredFeatures: ["hit-test"],
            optionalFeatures: ["dom-overlay"],
            domOverlay: { root: document.getElementById("hud") }
        });
        await renderer.xr.setSession(session);
        startButton.disabled = true;
        startButton.textContent = "AR running";
        setStatus("Move your phone slowly to find a flat surface.");
    } catch (error) {
        setStatus("Unable to start AR on this device.");
        console.error(error);
    }
}

startButton.addEventListener("click", startAR);
artifactButtons.buddha.addEventListener("click", () => selectArtifact("buddha"));
artifactButtons.casket.addEventListener("click", () => selectArtifact("casket"));
document.getElementById("rotate-left").addEventListener("click", () => {
    if (placedModel) placedModel.rotation.y += THREE.MathUtils.degToRad(15);
});
document.getElementById("rotate-right").addEventListener("click", () => {
    if (placedModel) placedModel.rotation.y -= THREE.MathUtils.degToRad(15);
});
document.getElementById("scale-down").addEventListener("click", () => {
    if (placedModel) placedModel.scale.multiplyScalar(0.9);
});
document.getElementById("scale-up").addEventListener("click", () => {
    if (placedModel) placedModel.scale.multiplyScalar(1.1);
});
document.getElementById("remove-object").addEventListener("click", () => {
    if (placedModel) {
        scene.remove(placedModel);
        placedModel = null;
        setStatus("Artifact removed. Tap a surface to place it again.");
    }
});
renderer.domElement.addEventListener("pointerdown", placeArtifact);
window.addEventListener("resize", () => renderer.setSize(window.innerWidth, window.innerHeight));
renderer.setAnimationLoop(render);
