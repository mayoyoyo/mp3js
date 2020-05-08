/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3, Vector2, Clock, AmbientLight, PointLight } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Audio, AudioListener, AudioLoader, AudioAnalyser } from 'three';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { SeedScene, SimpleScene } from 'scenes';
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

// Set up controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 16;
controls.update();

// Key Actions
const keyActions = [];
function addKeyAction(keySpec, onDown, onUp) {
    const action = {
        keySpec,
        onDown,
        onUp,
        isRepeat: false,
    };
    keyActions.push(action);
}

const aka = addKeyAction;
// https://keycode.info
const ArrowLeft = { key: "ArrowLeft", keyCode: 37, isPressed: false };
const ArrowRight = { key: "ArrowRight", keyCode: 39, isPressed: false };
const ArrowUp = { key: "ArrowUp", keyCode: 38, isPressed: false };
const boundKeys = [
    ArrowLeft,
    ArrowRight,
    ArrowUp
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
            if (isRepeat) {
                return;
            } else {
                action.isRepeat = true;
            }
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
            action.isRepeat = false;
            event.preventDefault();
            onUp(event);
        }
    })
});


var file = document.getElementById("fileInput");
var audioinput = document.getElementById("audio");

file.onchange = function () {
    if (!context) {
        context = new AudioContext();
    }
    var files = this.files;

    audioinput.src = URL.createObjectURL(files[0]);
    audioinput.play();
}


var context = new AudioContext();  // create context
var src = context.createMediaElementSource(audioinput); //create src inside ctx
var analyser = context.createAnalyser(); //create analyser in ctx
src.connect(analyser);         //connect analyser node to the src
analyser.connect(context.destination); // connect the destination 
// node to the analyser



let score = document.getElementById("Score");

let prevScore = 0;

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    controls.update();
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

    if (analyser) {

        analyser.fftSize = 64;
        var dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        scene.audiodata = new AudioData(dataArray);
    }

    if (scene.state.score != prevScore) {
        prevScore = scene.state.score;

        score.innerHTML = `Score: ${prevScore}`;
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
