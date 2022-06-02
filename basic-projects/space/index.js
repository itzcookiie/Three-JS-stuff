import * as THREE from 'three';
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

const highestAngle = 57.29577951308232;

const CUBE_COLOR = 0xFFFFFF; // white
const CUBE_CONSTANT = 0.1;
const CUBE_WIDTH = CUBE_CONSTANT;
const CUBE_HEIGHT = CUBE_CONSTANT;
const CUBE_DEPTH = CUBE_CONSTANT;
const CUBES_NUMBER = 10;

const ACCELERATION = 500.0;
const DECELERATION = 10.0;

const CAMERA_POS = {
    x: 0,
    y: 0,
    z: 0
}

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const angle = new THREE.Vector3();
let position;
const vector = new THREE.Vector3();

let time = null;

const xRangeStart = -250;
const xRangeDiff = 500;
const yRangeStart = -250;
const yRangeDiff = 500;
const zRangeStart = -250;
const zRangeDiff = 500;

const startCubeCords = [xRangeStart, yRangeStart, zRangeStart];

const thresholdPoints = {
    x: createAxisThresholdPoints(xRangeStart, xRangeDiff),
    y: createAxisThresholdPoints(yRangeStart, yRangeDiff),
    z: createAxisThresholdPoints(zRangeStart, zRangeDiff)
};

const generatedCubesData = [{
    startPos: startCubeCords,
    thresholdPoints
}];

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

const moveConstants = {
    left: 'left',
    right: 'right',
    forward: 'forward',
    back: 'back',
    up: 'up',
    down: 'down'
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
    camera.position.set(CAMERA_POS.x, CAMERA_POS.y, CAMERA_POS.z);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    const controls = new PointerLockControls(camera, document.body);

    const cubeObj = createCubeObj(scene);
    generateCubesNTimes(cubeObj, 10000);

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
        position = camera.position;
        // controls.getDirection(angle);
        // camera.getWorldDirection(vector);
        // angle.x = THREE.Math.radToDeg(Math.atan2(vector.x, vector.z)) + 180;
        // angle.y = THREE.Math.radToDeg(Math.atan2(vector.z, vector.y));
        // console.log(angle)
        // angle.x = THREE.Math.radToDeg(camera.rotation.y);
        // angle.y = THREE.Math.radToDeg(camera.rotation.x);


        const [minX, maxX] = thresholdPoints.x;
        const [minY, maxY] = thresholdPoints.y;
        const [minZ, maxZ] = thresholdPoints.z;

        if (position.x > maxX) {
            // Move past x max threshold
            console.log('Move past x max threshold')
            const newAxisThreshold = calculateNewAxisThreshold(moveConstants.right, xRangeDiff);
            thresholdPoints.x = newAxisThreshold;
        } else if (position.x < minX) {
            // Move past x min threshold
            console.log('Move past x min threshold')
            const newAxisThreshold = calculateNewAxisThreshold(moveConstants.left, xRangeDiff);
            thresholdPoints.x = newAxisThreshold;
        }

        if (position.y > maxY) {
            // Move past y max threshold
            console.log('Move past y max threshold')
            const newAxisThreshold = calculateNewAxisThreshold(moveConstants.up, yRangeDiff);
            thresholdPoints.y = newAxisThreshold;
        } else if (position.y < minY) {
            // Move past y min threshold
            console.log('Move past y min threshold')
            const newAxisThreshold = calculateNewAxisThreshold(moveConstants.down, yRangeDiff);
            thresholdPoints.y = newAxisThreshold;
        }

        if (-position.z > maxZ) {  // Forward is -ve so inverse pos
            // Move past z max threshold
            console.log('Move past z max threshold')
            const newAxisThreshold = calculateNewAxisThreshold(moveConstants.forward, zRangeDiff);
            thresholdPoints.z = newAxisThreshold;
            const newStartPos = getNewStartPos(moveConstants.forward);
            generatedCubesData.push(createCubeProps(newStartPos));
            generateCubesNTimes(cubeObj, 10000, ...newStartPos);
        } else if (position.z > -minZ) { // Backwards is +ve so make -ve threshold point positive
            // Move past z min threshold
            console.log('Move past z min threshold')
            const newAxisThreshold = calculateNewAxisThreshold(moveConstants.back, zRangeDiff);
            thresholdPoints.z = newAxisThreshold;
        }

        // IDEA: Add all the points we've crossed the axis threshold for into an array
        // E.g. ['x', 'y']
        //

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

function generateCubesNTimes(cubeObj, n, xRange=xRangeStart, yRange=yRangeStart, zRange=zRangeStart) {
    Array(n).fill(undefined).forEach((_, i) => {
        const x = getRandomNumberFromArr(createXRange(xRange));
        const y = getRandomNumberFromArr(createYRange(yRange));
        const z = getRandomNumberFromArr(createZRange(zRange));
        cubeObj.createCube(x, y, z);
    });
}

function createCubeProps(startPos) {
    return {
        startCords: startPos,
        thresholds: {
            x: createAxisThresholdPoints(startPos.x, xRangeDiff),
            y: createAxisThresholdPoints(startPos.y, yRangeDiff),
            z: createAxisThresholdPoints(startPos.z, zRangeDiff)
        }
    }
}

function shouldCreateDiagonalCubeObj() {

}

function getNewStartPos(direction) {  // For finding cords to generate new cube from
    const lastStartPos = generatedCubesData.at(-1).startPos;
    let [x, y, z] = [...lastStartPos];
    if (direction === moveConstants.forward) z -= zRangeDiff;
    if (direction === moveConstants.back) z += zRangeDiff;
    if (direction === moveConstants.up) y += yRangeDiff;
    if (direction === moveConstants.down) y -= yRangeDiff;
    if (direction === moveConstants.right) x += xRangeDiff;
    if (direction === moveConstants.left) x -= xRangeDiff;
    return [x, y, z];
}

function findAxisThreshold(direction) {
    if (direction === moveConstants.back) {

    }
}

function findCubeObjsInSameAlignment(currCube, direction) {
    if (direction === moveConstants.forward || direction === moveConstants.back) return findCubeObjsInSameZAxis(currCube, direction);
    if (direction === moveConstants.right || direction === moveConstants.left) return findCubeObjsInSameXAxis(currCube, direction);
    if (direction === moveConstants.up || direction === moveConstants.down) return findCubeObjsInSameYAxis(currCube, direction);
}

// TODO: Find all the cubes within the same axis for x,y,z
//  So we can know e.g. if we are moving backwards, what cubes are behind us
//  With this we can calculate the next threshold point and know whether to create new space or whether space there
//  already exists (i.e. we've passed there already)
function findCubeObjsInSameXAxis(currCube, direction) {
    return direction === moveConstants.right
        ? generatedCubesData.filter(generatedCube => generatedCube.startPos.x > currCube.x && generatedCube.startPos.y === currCube.y && generatedCube.startPos.z === currCube.z)
        : generatedCubesData.filter(generatedCube => generatedCube.startPos.x < currCube.x && generatedCube.startPos.y === currCube.y && generatedCube.startPos.z === currCube.z);
}

function findCubeObjsInSameYAxis(currCube, direction) {
    return direction === moveConstants.up
        ? generatedCubesData.filter(generatedCube => generatedCube.startPos.x === currCube.x && generatedCube.startPos.y > currCube.y && generatedCube.startPos.z === currCube.z)
        : generatedCubesData.filter(generatedCube => generatedCube.startPos.x === currCube.x && generatedCube.startPos.y < currCube.y && generatedCube.startPos.z === currCube.z);
}

function findCubeObjsInSameZAxis(currCube, direction) {
    return direction === moveConstants.forward
        ? generatedCubesData.filter(generatedCube => generatedCube.startPos.x === currCube.x && generatedCube.startPos.y === currCube.y && generatedCube.startPos.z < currCube.z)
        : generatedCubesData.filter(generatedCube => generatedCube.startPos.x === currCube.x && generatedCube.startPos.y === currCube.y && generatedCube.startPos.z > currCube.z);
}

function calculateNewAxisThreshold(direction, diff=500) {
    const zAxis = [moveConstants.forward, moveConstants.back];
    const yAxis = [moveConstants.up, moveConstants.down];
    const xAxis = [moveConstants.right, moveConstants.left];

    const positiveDirection = [zAxis[0], yAxis[0], xAxis[0]];

    let thresholdPoint;
    if (zAxis.includes(direction)) thresholdPoint = thresholdPoints.z;
    if (yAxis.includes(direction)) thresholdPoint = thresholdPoints.y;
    if (xAxis.includes(direction)) thresholdPoint = thresholdPoints.x;

    const thresholdPointCopy = [...thresholdPoint];
    positiveDirection.includes(direction) ? thresholdPointCopy[1] += diff : thresholdPointCopy[0] -= diff;
    return thresholdPointCopy
}

function createAxisThresholdPoints(start, diff) {  // For determining cords when passed over, will trigger the cube obj creation
    const halfDiff = diff / 2;
    const quarterDiff = halfDiff / 2;
    const midPoint = start + halfDiff;
    return [midPoint - quarterDiff, midPoint + quarterDiff];  // [-ve threshold, +ve threshold]
}

// function createAxisThresholdPoints(start, diff) {  If we more than one cube present
//     const halfDiff = diff / 2;
//     return [start - halfDiff, start + halfDiff, start + diff + halfDiff];  // [-ve threshold, curr threshold, +ve threshold]
// }

function createAxisRange(start, diff) {  // For determining cords for creating cube obj space
    return [start, start + diff];
}

function createXRange(start) {
    return createAxisRange(start, xRangeDiff);
}
function createYRange(start) {
    return createAxisRange(start, yRangeDiff);
}
function createZRange(start) {
    return createAxisRange(start, zRangeDiff);
}

function getRandomNumberFromArr([x, y]) {
    return getRandomNumber(x, y);
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function convertAngleToRatio(angle) {
    return THREE.Math.radToDeg(angle) / highestAngle
}