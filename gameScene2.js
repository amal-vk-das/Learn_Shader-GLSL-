import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

let mixers = [];
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 10, 60);

// Move composer setup to after camera creation
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.5,    // strength
    0.4,    // radius
    0.85     // threshold
);
composer.addPass(renderPass);
composer.addPass(bloomPass);

// Add fog to the scene
scene.fog = new THREE.FogExp2(0xb7d1e3, 0.009);
scene.background = new THREE.Color(0xb7d1e3);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const ambientLight = new THREE.AmbientLight(0x89b1c9, 0.9);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(-50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
scene.add(directionalLight);

// Add a second, softer directional light for fill
const fillLight = new THREE.DirectionalLight(0xffd5c0, 0.3);
fillLight.position.set(50, 50, -50);
scene.add(fillLight);

// Add TextureLoader
const textureLoader = new THREE.TextureLoader();

// Load all textures
const aoMap = textureLoader.load('textures/coast_sand_rocks_02_ao_2k.jpg');
const diffuseMap = textureLoader.load('textures/coast_sand_rocks_02_diff_2k.jpg');
const dispMap = textureLoader.load('textures/coast_sand_rocks_02_disp_2k.jpg');
const normalMapDX = textureLoader.load('textures/coast_sand_rocks_02_nor_dx_2k.jpg');
const normalMapGL = textureLoader.load('textures/coast_sand_rocks_02_nor_gl_2k.jpg');
const roughnessMap = textureLoader.load('textures/coast_sand_rocks_02_rough_2k.jpg');

// Create ground plane with updated material
const groundplane = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 200, 200, 200),
    new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        aoMap: aoMap,
        map: diffuseMap,
        displacementMap: dispMap,
        displacementScale: 2,
        normalMap: normalMapGL,
        roughnessMap: roughnessMap,
        normalScale: new THREE.Vector2(1.5, 1.5),
        roughness: 0.8,
        metalness: 0.1,
    })
);

groundplane.receiveShadow = true;

// Add UV2 for ambient occlusion map
groundplane.geometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(groundplane.geometry.attributes.uv.array, 2)
);

groundplane.position.set(0, -5, 0);
groundplane.rotation.x = -Math.PI / 2;
scene.add(groundplane);


const loader = new GLTFLoader();
loader.load('./models/mossyRocks.glb', function(gltf) {
    // First rock
    const rocks1 = gltf.scene.clone();
    rocks1.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(rocks1);
    rocks1.position.set(-120, -7,-20);
    rocks1.rotation.set(0, 0, 0);
    rocks1.scale.set(8, 8, 8);

    // Second rock
    const rocks2 = gltf.scene.clone();
    rocks2.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(rocks2);
    rocks2.position.set(120, -12, 0);
    rocks2.rotation.set(0, Math.PI/9, 0);
    rocks2.scale.set(8, 8, 8);

    // Third rock
    const rocks3 = gltf.scene.clone();
    rocks3.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(rocks3);
    rocks3.position.set(-10, -8, -200);
    rocks3.rotation.set(0, Math.PI/5, 0);
    rocks3.scale.set(8, 8, 8);

    // // Fourth rock
    const rocks4 = gltf.scene.clone();
    scene.add(rocks4);
    rocks4.position.set(5, 30, 10);
    rocks4.rotation.set(0, Math.PI/2, 0);
    rocks4.scale.set(9, 9, 9);
});


//trees
loader.load('./models/palm.glb', function(gltf) {
    // First palm tree
    const tree1 = gltf.scene.clone();
    tree1.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(tree1);
    tree1.position.set(-25, -12, 10);
    tree1.rotation.set(0, Math.PI/3, 0);
    tree1.scale.set(10, 10, 10);

    // Second palm tree
    const tree2 = gltf.scene.clone();
    tree2.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(tree2);
    tree2.position.set(20, -12, 18);
    tree2.rotation.set(0, Math.PI/4, 0);
    tree2.scale.set(9, 9, 9);

    // Third palm tree
    const tree3 = gltf.scene.clone();
    tree3.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(tree3);
    tree3.position.set(-2, -12, -25);
    tree3.rotation.set(0, Math.PI/6, 0);
    tree3.scale.set(9, 9, 9);
});

//mushroom__tree.glb
loader.load('./models/florida_foliage.glb', function(gltf) {
    const mushroomTree = gltf.scene;
    mushroomTree.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(mushroomTree);
    mushroomTree.position.set(8, -5, 0);
    mushroomTree.rotation.set(0, 5, 0);
    mushroomTree.scale.set(5, 5, 5);
});


//mushroom__tree.glb
loader.load('./models/wood_branch.glb', function(gltf) {
    const mushroomTree = gltf.scene;
    mushroomTree.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(mushroomTree);
    mushroomTree.position.set(8, 18,5);
    mushroomTree.rotation.set(10, 0, 0);
    mushroomTree.scale.set(4, 4, 4);
});


//mushrooms.glb
loader.load('./models/mushrooms.glb', function(gltf) {
    const mushrooms = gltf.scene;
    mushrooms.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(mushrooms);
    mushrooms.position.set(12, -10,40);
    // mushrooms.rotation.set(10, 0, 0);
    mushrooms.scale.set(15, 15, 15);
});


loader.load('./models/hangingplants.glb', function(gltf) {
    const hangingplants = gltf.scene;
    hangingplants.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(hangingplants);
    hangingplants.position.set(1, -15,3);
    hangingplants.rotation.set(0, Math.PI/20, 0);
    hangingplants.scale.set(28, 28, 28);
});

//glowing_flower.glb
loader.load('./models/glowing_flower.glb', function(gltf) {
    // Create and add instances of the glowing flower
    for(let i = 0; i < 12; i++) {
        const glowing_flower = gltf.scene.clone();
        
        // Create a mixer for this instance
        const mixer = new THREE.AnimationMixer(glowing_flower);
        
        // Play all animations
        if (gltf.animations.length > 0) {
            gltf.animations.forEach((clip) => {
                const action = mixer.clipAction(clip);
                action.play();
            });
            mixers.push(mixer);
        }
        
        glowing_flower.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(glowing_flower);
        
        // Randomize position within a reasonable area
        const x = Math.random() * 40 - 20;
        const z = Math.random() * 90 - 0;
        glowing_flower.position.set(x, -3.5, z);
        
        // Add slight random rotation
        glowing_flower.rotation.set(0, Math.random() * Math.PI * 2, 0);
    }
});

//smallplant
loader.load('./models/smallplant.glb', function(gltf) {
    // Create and add 15 instances of the small plant
    for(let i = 0; i < 45; i++) {
        const smallplant = gltf.scene.clone();
        smallplant.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(smallplant);
        
        // Randomize position within a reasonable area
        const x = Math.random() * 40 - 20; // -20 to 20
        const z = Math.random() * 120 - 20; // -20 to 20
        smallplant.position.set(x, -4, z);
        
        // Randomize rotation
        smallplant.rotation.set(0, Math.random() * Math.PI * 2, 0);
    }
});

const clock = new THREE.Clock();

const animate = () => {
    requestAnimationFrame(animate);
    
    // Update all mixers
    const delta = clock.getDelta();
    mixers.forEach((mixer) => mixer.update(delta));
    
    controls.update();
    composer.render();
};

animate();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
