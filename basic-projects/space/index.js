import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const mouseCords = {
    x: 0,
    y: 0
}

const CUBE_COLOR = 0xFFFFFF; // white
const CUBE_CONSTANT = 0.1;
const CUBE_WIDTH = CUBE_CONSTANT;
const CUBE_HEIGHT = CUBE_CONSTANT;
const CUBE_DEPTH = CUBE_CONSTANT;
const CUBES_NUMBER = 10;

const CAMERA_Z = 5;

const xRange = [-4, 4];
const yRange = [-2, 2];
const zRange = [-30, 0];

let keyboardCode = undefined;

const keyCodeMapping = {
    'KeyW': keyWHandler,
    'KeyA': keyAHandler,
    'KeyS': keySHandler,
    'KeyD': keyDHandler
};

function keyWHandler(camera) {
    camera.translateZ(-0.05);
}
function keyAHandler(camera) {
    camera.translateX(-0.05);
}
function keySHandler(camera) {
    camera.translateZ(0.05);
}
function keyDHandler(camera) {
    camera.translateX(0.05);

}

const keyEvents = {
    mousedown: false,
    mouseup: false
};

function handleMouseover(e, camera) {
    if(keyEvents.mousedown) {
        const deltaX = (e.clientX - mouseCords.x) / 1000;
        const deltaY = (e.clientY - mouseCords.y) / 1000;
        camera.rotation.x += deltaY;
        camera.rotation.y += deltaX;
        mouseCords.x = e.clientX;
        mouseCords.y = e.clientY;
    }
}

function handleMouseDownAndUp(e) {
    if(e.type === 'mousedown') {
        mouseCords.x = e.clientX;
        mouseCords.y = e.clientY;
    }

    keyEvents[e.type] = true;
    const otherKeyEvent = Object.keys(keyEvents).filter(keyEvent => keyEvent !== e.type);
    keyEvents[otherKeyEvent] = false;
}

function main() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(innerWidth, innerHeight);
    document.body.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 1, 500);

    camera.position.set(0, 0, CAMERA_Z);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    const cubeObj = createCubeObj(scene);
    generateCubesNTimes(cubeObj, 2000);

    // setInterval(() => generateCubes(), 2000);

    const animateCB = animateHOF(scene, camera, renderer, cubeObj);
    animateCB();

    document.body.addEventListener('keydown', e => {
        const { code } = e;
        keyboardCode = code;
    });
    document.body.addEventListener('keyup', e => {
        keyboardCode = undefined;
    });
    ['mousedown', 'mouseup'].forEach(
        eventListener => document.body.addEventListener(eventListener, handleMouseDownAndUp)
    )
    document.body.addEventListener('mousemove', e => {
        handleMouseover(e, camera);
    })

}

main();


function animateHOF(scene, camera, renderer, cubeObj) {
    return function animate() {
        requestAnimationFrame( animate );
        if(keyboardCode) keyCodeMapping[keyboardCode](camera);
        renderer.render( scene, camera );

        cubeObj.cubes.forEach(cube => {
            // cube.rotation.x += 0.01;
            // cube.rotation.y += 0.01;
            // cube.position.z += 0.01;
        });

        // cubeObj.cubes.forEach(cube => {
        //     // cube.rotation.x += 0.01;
        //     // cube.rotation.y += 0.01;
        //     cube.position.z += 0.01;
        //     if(cube.position.z > CAMERA_Z) cube.remove();
        // });
    }
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
        const x = getRandomNumberFromArr(xRange);
        const y = getRandomNumberFromArr(yRange);
        const z = getRandomNumberFromArr(zRange);
        cubeObj.createCube(x, y, z);
    });
}

function generateCubesNTimes(cubeObj, n) {
    Array(n).fill(undefined).forEach((_, i) => {
        const x = getRandomNumberFromArr(xRange);
        const y = getRandomNumberFromArr(yRange);
        const z = getRandomNumberFromArr(zRange);
        cubeObj.createCube(x, y, z);
    });
}

function getRandomNumberFromArr(range) {
    return getRandomNumber(range[0], range[1]);
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}