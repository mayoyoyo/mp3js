/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3, Vector2, Clock, AmbientLight, PointLight } from 'three';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { SimpleScene } from 'scenes';
import { AudioData } from 'music';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';

var params = {
    bloomStrength: 0.7,
    bloomRadius: 0.2,
    bloomThreshold: 0.1,

};

var bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1, 0.4, 0.1);
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;


// Initialize core ThreeJS components
const scene = new SimpleScene((prop, val) => {
    bloomPass[prop] = val
});
const camera = new PerspectiveCamera(45);
const renderer = new WebGLRenderer({ antialias: true });
renderer.toneMappingExposure = Math.pow(1.0, 2.0);

const renderScene = new RenderPass(scene, camera);



var composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

let copyShader = new ShaderPass(CopyShader);
copyShader.renderToScreen = true;
composer.addPass(copyShader);


// Set up camera
camera.position.set(15, 1, 0);
camera.lookAt(new Vector3(0, 0, 0));

scene.add(new AmbientLight(0x404040));

let pointLight = new PointLight(0xffffff, 1);
camera.add(pointLight);

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// Key Actions
const keyActions = [];
function addKeyAction(keySpec, onDown, onUp) {
    const action = {
        keySpec,
        onDown,
        onUp,
        isRepeat: true,
    };
    keyActions.push(action);
}

const aka = addKeyAction;
// https://keycode.info
const ArrowLeft = { key: "ArrowLeft", keyCode: 37, isPressed: false };
const ArrowRight = { key: "ArrowRight", keyCode: 39, isPressed: false };
const ArrowUp = { key: "ArrowUp", keyCode: 38, isPressed: false };
const ViewOne = { key: "1", keyCode: 49, isPressed: false };
const ViewTwo = { key: "2", keyCode: 50, isPressed: false };
const ViewThree = { key: "3", keyCode: 51, isPressed: false };
const Dodge = { key: "ArrowDown", keyCode: 40, isPressed: false };
const boundKeys = [
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    ViewOne,
    ViewTwo,
    ViewThree,
    Dodge
];

function watchKey(keyObj) {
    aka(
        keyObj,
        event => { keyObj.isPressed = true },
        event => { keyObj.isPressed = false },
    );
}
boundKeys.forEach(watchKey);

document.addEventListener('keydown', (event) => {
    event.preventDefault();
    keyActions.forEach((action) => {
        const { keySpec, onDown, isRepeat } = action;
        const { key, keyCode } = keySpec;
        if (event.key == key || event.keyCode == keyCode) {
            event.preventDefault();
            onDown(event);
        }
    });
});

document.addEventListener('keyup', (event) => {
    event.preventDefault();
    keyActions.forEach((action) => {
        const { keySpec, onUp } = action;
        const { key, keyCode } = keySpec;
        if (event.key == key || event.keyCode == keyCode) {
            event.preventDefault();
            onUp(event);
        }
    })
});

var file = document.getElementById("fileInput");
var audioinput = document.getElementById("audio");
var analyser;
var context;
var src;

file.onchange = function () {
    context = context || new AudioContext();  // create context
    src = src || context.createMediaElementSource(audioinput); //create src inside ctx
    analyser = context.createAnalyser(); //create analyser in ctx
    src.connect(analyser);         //connect analyser node to the src
    analyser.connect(context.destination); // connect the destination
    // node to the analyser
    var files = this.files;
    audioinput.src = URL.createObjectURL(files[0]);
    audioinput.pause();

    scene.state.score = 0;
    scene.reset();
}


document.getElementById("playAudio").addEventListener('click', function () {
    handlePause();
    context.resume();
});

let score = document.getElementById("Score");

let prevScore = 0;

function changeSpeed(val) {
    scene.wall1.setSpeed(val);
    scene.wall2.setSpeed(val);
    scene.floor.setSpeed(val);
    scene.state.speed = val;
    for (let i = 0; i < scene.orbs.length; i++) scene.orbs[i].state.speed = val;
}

const INITIAL_SPEED = 0.4;
let prevSpeed = INITIAL_SPEED;

function handlePause() {
    if (!scene.state.paused) {
        prevSpeed = scene.state.speed;;
        scene.state.paused = true;
        changeSpeed(0);
    } else {
        scene.state.paused = false;
        changeSpeed(prevSpeed);
    }
}

function gameover() {
  handlePause();
  scene.reportStats();
  scene.reset();
}

document.getElementById('audio').addEventListener("ended", gameover, false);

document.getElementById("playAudio").addEventListener('click', function () {
    // reset score if new game
    if (document.getElementById("gameover-text").innerHTML != "") {
      scene.state.score = 0;
    }
});

document.getElementById("pausebutton").addEventListener('click', function () {
    if (!scene.state.paused) handlePause();
});

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    // controls.update();
    composer.render();

    scene.state.playerInputs = { left: false, right: false, jumped: false };
    if (ArrowUp.isPressed) {
        scene.state.playerInputs.jumped = true;
    }
    if (ArrowLeft.isPressed) {
        scene.state.playerInputs.left = true;
    }
    if (ArrowRight.isPressed) {
        scene.state.playerInputs.right = true;
    }
    if (ViewOne.isPressed) {
        scene.state.cameraAngle = "ViewOne";
    }
    if (ViewTwo.isPressed) {
        scene.state.cameraAngle = "ViewTwo";
    }
    if (ViewThree.isPressed) {
        scene.state.cameraAngle = "ViewThree";
    }
    if (Dodge.isPressed) {
        if (!scene.state.paused) {
          scene.player.shieldMesh.material.opacity = 0.15;
          scene.state.playerDodge = true;
        }
    } else {
        scene.player.shieldMesh.material.opacity = 0;
        scene.state.playerDodge = false;
    }

    if (scene.state.cameraAngle == "ViewOne") {
        camera.position.set(15, 1, 0);
        camera.lookAt(new Vector3())
    }
    else if (scene.state.cameraAngle == "ViewTwo") {
        let pPos = scene.player.position;
        camera.position.set(pPos.x + 5, pPos.y + 2, pPos.z);
        camera.lookAt(new Vector3(-1000, 0, 0));
    }
    else if (scene.state.cameraAngle == "ViewThree") {
        camera.position.set(13, 1.25, -7.25);
        camera.lookAt(new Vector3());
    }

    if (analyser) {

        analyser.fftSize = 64;
        var dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        scene.audiodata = new AudioData(dataArray);
    }

    if (scene.state.score != prevScore) {
        prevScore = scene.state.score;

        score.innerHTML = "SCORE:"  + "<br />" + `${prevScore}`;
    }

    //renderer.render(scene, camera);
    scene.update && scene.update(timeStamp);

    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
