import * as THREE from 'three';

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

function KeyWHandler(camera) {
    camera.position.z -= 0.05;
}
function KeyAHandler(camera) {
    camera.position.x -= 0.05;
}
function KeySHandler(camera) {
    camera.position.z += 0.05;
}
function KeyDHandler(camera) {
    camera.position.x += 0.05;
}

const keyCodeMapping = {
    'KeyW': KeyWHandler,
    'KeyA': KeyAHandler,
    'KeyS': KeySHandler,
    'KeyD': KeyDHandler
};

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

    document.body.addEventListener('keypress', e => {
        const { code } = e;
        keyCodeMapping[code](camera);
    });
}

main();


function animateHOF(scene, camera, renderer, cubeObj) {
    return function animate() {
        requestAnimationFrame( animate );
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