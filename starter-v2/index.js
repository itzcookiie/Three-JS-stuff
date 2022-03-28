import * as THREE from 'three';

const addObject = addObjectWrapper();

function main() {
    const canvas = document.getElementById("c");
    const renderer = new THREE.WebGLRenderer({ canvas });

    const fov = 40;
    const aspect = 2;  // canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 120;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xAAAAAA);

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    const cubes = [
        makeInstance(scene, geometry, 0x44aa88, 0),
        makeInstance(scene, geometry, 0x8844aa, -2),
        makeInstance(scene, geometry, 0xaa8844, 2)
    ];

    renderer.render(scene, camera);

    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        })

        renderer.render(scene, camera);
        requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function createMaterial() {
    const material = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
    });

    const hue = Math.random();
    const saturation = 1;
    const luminance = .5;
    material.color.setHSL(hue, saturation, luminance);

    return material;
}

function makeInstance(scene, geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);

    scene.add(cube);
    cube.position.x = x;

    return cube;
}

function addObjectWrapper() {
    const objects = [];
    const spread = 15;

    return function(scene, x, y, obj) {
        obj.position.x = x * spread;
        obj.position.y = y * spread;

        scene.add(obj);
        objects.push(obj);
    }
}

function addSolidGeometry(scene, x, y, geometry) {
    const mesh = new THREE.Mesh(geometry, createMaterial());
    addObject(scene, x, y, mesh);
}

main()