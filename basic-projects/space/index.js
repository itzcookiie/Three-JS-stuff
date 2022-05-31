import * as THREE from 'three';
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";


const CUBE_COLOR = 0xFFFFFF; // white
const CUBE_CONSTANT = 0.1;
const CUBE_WIDTH = CUBE_CONSTANT;
const CUBE_HEIGHT = CUBE_CONSTANT;
const CUBE_DEPTH = CUBE_CONSTANT;
const CUBES_NUMBER = 10;

const ACCELERATION = 100.0;
const DECELERATION = 10.0;

const CAMERA_Z = 0;  // -15 is threshold point

const xRangeStart = -250;
const xRangeDiff = 500;
const yRangeStart = -250;
const yRangeDiff = 500;
const zRangeStart = -250;
const zRangeDiff = 250;

const xThreshold = createAxisThreshold(xRangeStart, xRangeDiff);
const yThreshold = createAxisThreshold(yRangeStart, yRangeDiff);
const zThreshold = createAxisThreshold(zRangeStart, zRangeDiff);

const area = {  // Use for calculating threshold points to detect when to create new objects on screen
    FL: {  // Forward left. Represents left view completely including + 1/2y and -1/2y above and below
        xRange: [-15, 0],
        yRange: [-2, 2],
        zRange: [-30, 0]
    },
    FR: {  // Forward right. Represents right view completely including + 1/2y and -1/2y above and below
        xRange: [0, 15],
        yRange: [-2, 2],
        zRange: [-30, 0]
    },
    BL: {  // Backward left. Represents behind right left completely including + 1/2y and -1/2y above and below
        xRange: [-15, 0],
        yRange: [-2, 2],
        zRange: [0, 30]
    },
    BR: {  // Backward right. Represents behind right view completely including + 1/2y and -1/2y above and below
        xRange: [0, 15],
        yRange: [-2, 2],
        zRange: [0, 30]
    },
}

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let time = null;

const moveConstants = {
    left: 'left',
    right: 'right',
    forward: 'forward',
    back: 'back'
}

const move = {
    left: false,
    right: false,
    forward: false,
    back: false
};

const keyCodeMapping = {
    'KeyW': moveConstants.forward,
    'KeyA': moveConstants.left,
    'KeyS': moveConstants.back,
    'KeyD': moveConstants.right
};

function handleMovement(e, moveDir) {
    if(e.type === 'keydown') move[moveDir] = true;
    if(e.type === 'keyup') move[moveDir] = false;
}

function handleMouseDownAndUp(e, controls) {
    if(e.button === 0) {
        e.type === 'mousedown' ? controls.lock() : controls.unlock();
    }

}

function main() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(innerWidth, innerHeight);
    document.body.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 1, 500);
    camera.position.set(0, 0, CAMERA_Z);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    const controls = new PointerLockControls(camera, document.body);

    const cubeObj = createCubeObj(scene);
    generateCubesNTimes(cubeObj, 2000);

    // setInterval(() => generateCubes(), 2000);

    const animateCB = animateHOF(scene, camera, renderer, cubeObj, controls);
    animateCB(null);

    ['mousedown', 'mouseup'].forEach(
        eventListener => document.body.addEventListener(eventListener, e => handleMouseDownAndUp(e, controls))
    );
    ['keydown', 'keyup'].forEach(
        eventListener => document.body.addEventListener(eventListener, e => handleMovement(e, keyCodeMapping[e.code]))
    );

    window.addEventListener( 'resize', e => onWindowResize(camera, renderer));

}

// Make separate file and call this there. E.g. make file called App.js and move all this code there.
// Then in this file, call this.
main();


function animateHOF(scene, camera, renderer, cubeObj, controls) {
    return function animate(timestamp) {
        requestAnimationFrame( animate );

        if (time) {
            const delta = (timestamp - time) / 1000;

            velocity.x -= velocity.x * DECELERATION * delta;
            velocity.z -= velocity.z * DECELERATION * delta;

            direction.z = Number( move.forward ) - Number( move.back );
            direction.x = Number( move.right ) - Number( move.left );
            direction.normalize(); // this ensures consistent movements in all directions

            if ( move.forward || move.back ) velocity.z -= direction.z * ACCELERATION * delta;
            if ( move.left || move.right ) velocity.x -= direction.x * ACCELERATION * delta;

            camera.translateZ(  velocity.z * delta );
            camera.translateX( - velocity.x * delta );

        }

        // cubeObj.cubes.forEach(cube => {
        //     // cube.rotation.x += 0.01;
        //     // cube.rotation.y += 0.01;
        //     cube.position.z += 0.01;
        //     if(cube.position.z > CAMERA_Z) cube.remove();
        // });

        time = timestamp;

        renderer.render( scene, camera );
    }
}

function onWindowResize(camera, renderer) {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function createCubeObj(scene) {
    return {
        cubes: [],
        createCube(x, y, z) {
            const geometry = new THREE.BoxGeometry(CUBE_WIDTH, CUBE_HEIGHT, CUBE_DEPTH);
            const material = new THREE.MeshBasicMaterial({ color: CUBE_COLOR });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.x = x;
            cube.position.y = y;
            cube.position.z = z;

            scene.add(cube);
            this.cubes.push(cube);
        }
    }
}

function generateCubes(cubeObj) {
    Array(CUBES_NUMBER).fill(undefined).forEach((_, i) => {
        const x = getRandomNumberFromArr(createXRange(xRangeStart));
        const y = getRandomNumberFromArr(createYRange(yRangeStart));
        const z = getRandomNumberFromArr(createZRange(zRangeStart));
        cubeObj.createCube(x, y, z);
    });
}

function generateCubesNTimes(cubeObj, n) {
    Array(n).fill(undefined).forEach((_, i) => {
        const x = getRandomNumberFromArr(createXRange(xRangeStart));
        const y = getRandomNumberFromArr(createYRange(yRangeStart));
        const z = getRandomNumberFromArr(createZRange(zRangeStart));
        cubeObj.createCube(x, y, z);
    });
}

function createAxisThreshold(start, diff) {
    const halfDiff = diff / 2;
    return [start - halfDiff, start + halfDiff, start + diff + halfDiff];  // [-ve threshold, curr threshold, +ve threshold]
}

function createAxisRange(start, diff) {
    return [start, start + diff]
}

function createXRange(start) {
    return createAxisRange(start, xRangeDiff)
}
function createYRange(start) {
    return createAxisRange(start, yRangeDiff)
}
function createZRange(start) {
    return createAxisRange(start, zRangeDiff)
}

function getRandomNumberFromArr([x, y]) {
    return getRandomNumber(x, y);
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}