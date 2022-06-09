import * as THREE from 'three';
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

const CUBE_COLOR = 0xFFFFFF; // white
const CUBE_CONSTANT = 0.1;
const CUBE_WIDTH = CUBE_CONSTANT;
const CUBE_HEIGHT = CUBE_CONSTANT;
const CUBE_DEPTH = CUBE_CONSTANT;
const CUBES_NUMBER = 1000;
const AXIS = {
    x: 'x',
    y: 'y',
    z: 'z',
}

const ACCELERATION = 800.0;
const DECELERATION = 10.0;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
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

let state = createInitialCubeData();

const generatedCubesData = [createInitialCubeData()];

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

function currentMovingDirection() {
    return Object.keys(move).filter(_moveDir => move[_moveDir])
}

function handleMovement(e, moveDir) {
    // console.log(currentMovingDirection())
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
    generateCubesNTimes(cubeObj, CUBES_NUMBER);

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
        camera.getWorldDirection(vector);
        // angle.x = THREE.Math.radToDeg(Math.atan2(vector.x, vector.z));
        // angle.y = THREE.Math.radToDeg(Math.atan2(vector.z, vector.y));
        // console.log(angle.x)

        const currCube = getCurrentCube()[0];
        state = currCube;

        const [minX, maxX] = state.thresholdPoints.x;
        const [minY, maxY] = state.thresholdPoints.y;
        const [minZ, maxZ] = state.thresholdPoints.z;

        if (position.x > maxX && position.z < maxZ) {  // Moving forward and hitting right diagonal
            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX + xRangeDiff, startY, startZ + zRangeDiff];

            console.log('MAX Z AND MAX X DIAGONAL INTERSECTION !!!')

            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        } else if (position.x < minX && position.z < maxZ) {  // Moving forward and hitting left diagonal
            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX - xRangeDiff, startY, startZ + zRangeDiff];

            console.log('MAX Z AND MIN X DIAGONAL INTERSECTION !!!')

            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        }

        if (position.x < minX && position.z > minZ) {  // Moving back and hitting left diagonal
            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX - xRangeDiff, startY, startZ - zRangeDiff];

            console.log('MIN Z AND MIN X DIAGONAL INTERSECTION !!!')

            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        } else if (position.x > maxX && position.z > minZ) {  // Moving back and hitting right diagonal
            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX + xRangeDiff, startY, startZ - zRangeDiff];

            console.log('MIN Z AND MAX X DIAGONAL INTERSECTION !!!')

            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        }

        if (position.y > maxY && position.z < maxZ && position.x > maxX) {  // Going up forwards and hitting right diagonal
            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX + xRangeDiff, startY + yRangeDiff, startZ + zRangeDiff];

            console.log('MAX Z, MAX Y AND MAX X DIAGONAL INTERSECTION !!!')

            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        } else if (position.y > maxY && position.z < maxZ && position.x < minX) {  // Going up forwards and hitting left diagonal
            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX - xRangeDiff, startY + yRangeDiff, startZ + zRangeDiff];

            console.log('MAX Z, MAX Y AND MIN X DIAGONAL INTERSECTION !!!')

            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        }

        if (position.y > maxY && position.z > minZ && position.x > maxX) {  // Going up backwards and hitting right diagonal
            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX + xRangeDiff, startY + yRangeDiff, startZ - zRangeDiff];

            console.log('MIN Z, MAX Y AND MAX X DIAGONAL INTERSECTION !!!')

            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        } else if (position.y > maxY && position.z > minZ && position.x < minX) {  // Going up backwards and hitting left diagonal
            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX - xRangeDiff, startY + yRangeDiff, startZ - zRangeDiff];

            console.log('MIN Z, MAX Y AND MIN X DIAGONAL INTERSECTION !!!')

            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        }

        if (position.y > maxY && position.z > minZ && position.x > maxX) {  // Going down forwards and hitting right diagonal
            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX + xRangeDiff, startY - yRangeDiff, startZ + zRangeDiff];

            console.log('MAX Z, MIN Y AND MAX X DIAGONAL INTERSECTION !!!')

            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        } else if (position.y > maxY && position.z > minZ && position.x < minX) {  // Going down forwards and hitting left diagonal
            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX - xRangeDiff, startY - yRangeDiff, startZ + zRangeDiff];

            console.log('MIN Z, MIN Y AND MIN X DIAGONAL INTERSECTION !!!')

            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        }

        if (position.y > maxY && position.z > minZ && position.x > maxX) {  // Going down backwards and hitting right diagonal
            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX + xRangeDiff, startY - yRangeDiff, startZ - zRangeDiff];

            console.log('MIN Z, MIN Y AND MAX X DIAGONAL INTERSECTION !!!')

            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        } else if (position.y > maxY && position.z > minZ && position.x < minX) {  // Going down backwards and hitting left diagonal
            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX - xRangeDiff, startY - yRangeDiff, startZ - zRangeDiff];

            console.log('MIN Z, MIN Y AND MIN X DIAGONAL INTERSECTION !!!')

            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        }

        if (position.z < maxZ) {  // Forward is -ve so inverse pos
            // Move past z max threshold
            console.log('Move past z max threshold');
            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX, startY, startZ + zRangeDiff];
            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        } else if (position.z > minZ) { // Backwards is +ve so make -ve threshold point positive
            // Move past z min threshold
            console.log('Move past z min threshold');
            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX, startY, startZ - zRangeDiff];
            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }

        }

        if (position.x > maxX) {  // Move past x max threshold
            console.log('Move past x max threshold')

            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX + xRangeDiff, startY, startZ];
            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        } else if (position.x < minX) {  // Move past x min threshold
            console.log('Move past x min threshold')
            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX - xRangeDiff, startY, startZ];

            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        }

        if (position.y > maxY) {  // Move past y max threshold
            console.log('Move past y max threshold')

            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX, startY + yRangeDiff, startZ];

            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        } else if (position.y < minY) {  // Move past y min threshold

            console.log('Move past y min threshold')

            const [startX, startY, startZ] = state.startPos;
            const newStartPos = [startX, startY - yRangeDiff, startZ];

            if (canCreateCubeArea(newStartPos)) {
                generatedCubesData.push(createCubeProps(newStartPos));
                generateCubesNTimes(cubeObj, CUBES_NUMBER, ...newStartPos);
            }
        }

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

function createInitialCubeData() {
    return {
        startPos: startCubeCords,
        shortStartPos: '0,0,0',
        thresholdPoints: {
            x: createAxisThresholdPoints(xRangeStart, xRangeDiff),
            y: createAxisThresholdPoints(yRangeStart, yRangeDiff),
            z: createAxisThresholdPoints(zRangeStart, zRangeDiff)
        }
    }
}


// Extra: Add some extra props to know when we've created a new cube area e.g. above, below and to the sides of the
// current cube
// That way we can quickly check if we've created an cube area already before we check through all the generated cubes
// Also can spend some time deleting cubes far away, so we don't keep extra cubes in memory and make it quicker to filter
function createCubeProps(startPos) {
    const [x,y,z] = startPos;
    const shortStartPos = {
        x: (x - xRangeStart) / xRangeDiff,
        y: (y - yRangeStart) / yRangeDiff,
        z: (z - zRangeStart) / zRangeDiff,
    }

    return {
        startPos,
        shortStartPos: `${shortStartPos.x},${shortStartPos.y},${shortStartPos.z}`,
        thresholdPoints: {
            x: createAxisThresholdPoints(x, xRangeDiff),
            y: createAxisThresholdPoints(y, yRangeDiff),
            z: createAxisThresholdPoints(z, zRangeDiff)
        }
    }
}

// Can refactor based on current usage
// Make the input an object
// E.g. pass in whatever part of the axis has changed e.g. {z: z + zRangeDiff}
// Create a new obj based on the current state startPos with the new axis we passed in
// Whatever we passed in will override what is in state
// Return a new startPos array e.g. [...Object.values(newObjWeCreated)]
function getNewStartPos(direction) {  // For finding cords to generate new cube from
    const [x, y, z] = [...state.startPos];
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

function canCreateCubeArea([x, y, z]) {
    return generatedCubesData.filter(generatedCube => {
        const [generatedCubeX, generatedCubeY, generatedCubeZ] = generatedCube.startPos;
        return generatedCubeX === x && generatedCubeY === y && generatedCubeZ === z
    }).length === 0
}

function createAxisThresholdPoints(start, diff) {  // For determining cords when passed over, will trigger the cube obj creation
    const halfDiff = diff / 2;
    const quarterDiff = halfDiff / 2;
    const midPoint = start + halfDiff;
    return [midPoint - quarterDiff, midPoint + quarterDiff];  // [-ve threshold, +ve threshold]
}

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