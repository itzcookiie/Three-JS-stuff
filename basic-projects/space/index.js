import * as THREE from 'three';
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

const highestAngle = 57.29577951308232;

const CUBE_COLOR = 0xFFFFFF; // white
const CUBE_CONSTANT = 0.1;
const CUBE_WIDTH = CUBE_CONSTANT;
const CUBE_HEIGHT = CUBE_CONSTANT;
const CUBE_DEPTH = CUBE_CONSTANT;
const CUBES_NUMBER = 10;

const ACCELERATION = 800.0;
const DECELERATION = 10.0;

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
const zRangeStart = 250;
const zRangeDiff = -500;

const CAMERA_POS = {
    x: 0,
    y: 0,
    z: zRangeStart
}

const startCubeCords = [xRangeStart, yRangeStart, zRangeStart];

const state = {
    thresholdPoints: {
        x: createAxisThresholdPoints(xRangeStart, xRangeDiff),
        y: createAxisThresholdPoints(yRangeStart, yRangeDiff),
        z: createAxisThresholdPoints(zRangeStart, zRangeDiff)
    }
};

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
        camera.updateMatrixWorld();
        position = camera.position;
        // console.log(position)
        // controls.getDirection(angle);
        // camera.getWorldDirection(vector);
        // angle.x = THREE.Math.radToDeg(Math.atan2(vector.x, vector.z)) + 180;
        // angle.y = THREE.Math.radToDeg(Math.atan2(vector.z, vector.y));
        // console.log(angle)
        // angle.x = THREE.Math.radToDeg(camera.rotation.y);
        // angle.y = THREE.Math.radToDeg(camera.rotation.x);

        // console.log(getCurrentCube())


        const [minX, maxX] = state.thresholdPoints.x;
        const [minY, maxY] = state.thresholdPoints.y;
        const [minZ, maxZ] = state.thresholdPoints.z;
        
        // TODO: Need to finish off the below code
        //  Where we check what direction we are moving in
        //  Then use the direction as a way to find the threshold point
        //  E.g. finding the cube most ahead/behind and using the start cords to find the threshold point
        //  If there isn't any cubes (only the first 1 made upon spawn), then it should use itself as the base
        //  All the code below .e.g position.x > maxM should go within the corresponding direction condition
        //  Whole idea is we calculate the threshold point based on what cube we are currently occupying
        if (move.forward) {
            // const a = findAxisThreshold(moveConstants.forward);
        } else if (move.back) {
            const a = findAxisThreshold(moveConstants.back);
            console.log(a)
        }

        if (move.right) {
            // const a = findAxisThreshold(moveConstants.right);
        } else if (move.left) {
            // const a = findAxisThreshold(moveConstants.left);
        }

        if (position.x > maxX) {
            // Move past x max threshold
            console.log('Move past x max threshold')
            const newAxisThreshold = calculateNewAxisThreshold(moveConstants.right, xRangeDiff);
            state.thresholdPoints.x = newAxisThreshold;
            const newStartPos = getNewStartPos(moveConstants.right);
            console.log(newStartPos)
            generatedCubesData.push(createCubeProps(newStartPos));
            generateCubesNTimes(cubeObj, 10000, ...newStartPos);
        } else if (position.x < minX) {
            // Move past x min threshold
            console.log('Move past x min threshold')
            const newAxisThreshold = calculateNewAxisThreshold(moveConstants.left, xRangeDiff);
            state.thresholdPoints.x = newAxisThreshold;
        }

        if (position.y > maxY) {
            // Move past y max threshold
            console.log('Move past y max threshold')
            const newAxisThreshold = calculateNewAxisThreshold(moveConstants.up, yRangeDiff);
            state.thresholdPoints.y = newAxisThreshold;
        } else if (position.y < minY) {
            // Move past y min threshold
            console.log('Move past y min threshold')
            const newAxisThreshold = calculateNewAxisThreshold(moveConstants.down, yRangeDiff);
            state.thresholdPoints.y = newAxisThreshold;
        }

        if (position.z < maxZ) {  // Forward is -ve so inverse pos
            // Move past z max threshold
            console.log('Move past z max threshold')
            const newAxisThreshold = calculateNewAxisThreshold(moveConstants.forward, zRangeDiff);
            state.thresholdPoints.z = newAxisThreshold;
            const newStartPos = getNewStartPos(moveConstants.forward);
            console.log(newStartPos)
            generatedCubesData.push(createCubeProps(newStartPos));
            generateCubesNTimes(cubeObj, 10000,...newStartPos);
        } else if (position.z > minZ) { // Backwards is +ve so make -ve threshold point positive
            // Move past z min threshold
            console.log('Move past z min threshold')
            const newAxisThreshold = calculateNewAxisThreshold(moveConstants.back, zRangeDiff);
            state.thresholdPoints.z = newAxisThreshold;
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
    const [x,y,z] = startPos;
    return {
        startPos,
        thresholdPoints: {
            x: createAxisThresholdPoints(x, xRangeDiff),
            y: createAxisThresholdPoints(y, yRangeDiff),
            z: createAxisThresholdPoints(z, zRangeDiff)
        }
    }
}

function shouldCreateDiagonalCubeObj() {

}

function getNewStartPos(direction) {  // For finding cords to generate new cube from
    const lastStartPos = generatedCubesData.at(-1).startPos;
    const [x, y, z] = [...lastStartPos];
    if (direction === moveConstants.forward) return [x, y, z + zRangeDiff];
    if (direction === moveConstants.back) return [x, y, z - zRangeDiff];
    if (direction === moveConstants.up) return [x, y + yRangeDiff, z];
    if (direction === moveConstants.down) return [x, y - yRangeDiff, z];
    if (direction === moveConstants.right) return [x + xRangeDiff, y, z];
    if (direction === moveConstants.left) return [x - xRangeDiff, y, z];
}

function getCurrentCube() {
    return generatedCubesData.filter(generatedCube => {
        const [x, y, z] = generatedCube.startPos;
        const [xMin, xMax] = createXRange(x);
        const [yMin, yMax] = createYRange(y);
        const [zMin, zMax] = createZRange(z);
        return position.x >= xMin && position.x <= xMax && position.y >= yMin && position.y <= yMax && position.z >= zMax && position.z <= zMin;
    })
}

function findAxisThreshold(direction) {
    const currCube = getCurrentCube();
    const cubeObjsInSameAlignment = findCubeObjsInSameAlignment(currCube[0], direction);
    console.log(cubeObjsInSameAlignment)
    if (cubeObjsInSameAlignment.length) {
        const furthestCubeObj = findFurthestCubeObj(cubeObjsInSameAlignment, direction);
        const {x: [minX, maxX], y: [minY, maxY], z: [backwardZ, forwardZ]} = furthestCubeObj.thresholdPoints;
        if (direction === moveConstants.left) return minX;
        if (direction === moveConstants.right) return maxX;
        if (direction === moveConstants.up) return maxY;
        if (direction === moveConstants.down) return minY;
        if (direction === moveConstants.forward) return forwardZ;
        if (direction === moveConstants.back) return backwardZ;
    }
}

function findCubeObjsInSameAlignment({ startPos }, direction) {
    if (direction === moveConstants.forward || direction === moveConstants.back) return findCubeObjsInSameZAxis(startPos, direction);
    if (direction === moveConstants.right || direction === moveConstants.left) return findCubeObjsInSameXAxis(startPos, direction);
    if (direction === moveConstants.up || direction === moveConstants.down) return findCubeObjsInSameYAxis(startPos, direction);
}

function findCubeObjsInSameXAxis([x, y, z], direction) {
    return direction === moveConstants.right
        ? generatedCubesData.filter(generatedCube => generatedCube.startPos[0] >= x && generatedCube.startPos[1] === y && generatedCube.startPos[2] === z)
        : generatedCubesData.filter(generatedCube => generatedCube.startPos[0] <= x && generatedCube.startPos[1] === y && generatedCube.startPos[2] === z);
}

function findCubeObjsInSameYAxis([x, y, z], direction) {
    return direction === moveConstants.up
        ? generatedCubesData.filter(generatedCube => generatedCube.startPos[0] === x && generatedCube.startPos[1] >= y && generatedCube.startPos[2] === z)
        : generatedCubesData.filter(generatedCube => generatedCube.startPos[0] === x && generatedCube.startPos[1] <= y && generatedCube.startPos[2] === z);
}

function findCubeObjsInSameZAxis([x, y, z], direction) {
    return direction === moveConstants.forward
        ? generatedCubesData.filter(generatedCube => generatedCube.startPos[0] === x && generatedCube.startPos[1] === y && generatedCube.startPos[2] <= z)
        : generatedCubesData.filter(generatedCube => generatedCube.startPos[0] === x && generatedCube.startPos[1] === y && generatedCube.startPos[2] >= z);
}

// Gets the cube furthest away from curr obj
// e.g. if we have 3 cubes created in front of us and we are moving forward, it will find the cube obj most ahead i.e. the 3rd cube ahead
function findFurthestCubeObj(cubes, direction) {
    const copy = [...cubes];
    if (direction === moveConstants.right) copy.sort((cubeA, cubeB) => cubeA.startPos[0] - cubeB.startPos[0]);  // Sort in ascending order: last item = most +ve number
    if (direction === moveConstants.left) copy.sort((cubeA, cubeB) => cubeB.startPos[0] - cubeA.startPos[0]);  // Sort in descending order: last item = most -ve number
    if (direction === moveConstants.up) copy.sort((cubeA, cubeB) => cubeA.startPos[1] - cubeB.startPos[1]);  // Sort in ascending order: last item = most +ve number
    if (direction === moveConstants.down) copy.sort((cubeA, cubeB) => cubeB.startPos[1] - cubeA.startPos[1]);  // Sort in descending order: last item = most -ve number
    if (direction === moveConstants.forward) copy.sort((cubeA, cubeB) => cubeB.startPos[2] - cubeA.startPos[2]);  // Sort in descending order: last item = most -ve number
    if (direction === moveConstants.back) copy.sort((cubeA, cubeB) => cubeA.startPos[2] - cubeB.startPos[2]);  // Sort in ascending order: last item = most +ve number
    return copy[0];
}

function calculateNewAxisThreshold(direction, diff=500) {
    const zAxis = [moveConstants.forward, moveConstants.back];
    const yAxis = [moveConstants.up, moveConstants.down];
    const xAxis = [moveConstants.right, moveConstants.left];

    const positiveDirection = [zAxis[0], yAxis[0], xAxis[0]];

    let thresholdPoint;
    if (zAxis.includes(direction)) thresholdPoint = state.thresholdPoints.z;
    if (yAxis.includes(direction)) thresholdPoint = state.thresholdPoints.y;
    if (xAxis.includes(direction)) thresholdPoint = state.thresholdPoints.x;

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