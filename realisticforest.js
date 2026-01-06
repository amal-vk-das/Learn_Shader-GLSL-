import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

// Create VR camera rig
const cameraRig = new THREE.Group();
const vrCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
cameraRig.add(vrCamera);
scene.add(cameraRig);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));
renderer.shadowMap.enabled = true;

// Adjust initial camera positions
camera.position.set(20, 3.6, 5);
cameraRig.position.set(20, 5, 5); // This will now affect the VR starting position

let skybox;

// scene.fog = new THREE.FogExp2(0xf2f2f2, 0.001);

const params = {
    height: 120,
    radius: 9500,
    enabled: true,
};

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Create a directional light
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(-30, 50, 20);
scene.add(light);
light.castShadow = true;

light.shadow.mapSize.set(1024, 1024);
light.shadow.camera.far = 150;
light.shadow.camera.near = 1;
light.shadow.camera.left = -50;
light.shadow.camera.right = 50;
light.shadow.camera.top = 50;
light.shadow.camera.bottom = -50;

const lighthelper = new THREE.DirectionalLightHelper(light);
// scene.add(lighthelper);

// Create a cube
const planeGeometry = new THREE.PlaneGeometry(10000, 10000);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// scene.add(plane);
plane.rotateX(-Math.PI / 2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Optional: Modify OrbitControls settings for VR
controls.target.set(0, 1.6, 0);
controls.maxPolarAngle = Math.PI;
// controls.minDistance = 1;
// controls.maxDistance = 50;

const hdrLoader = new RGBELoader();
const envMap = await hdrLoader.loadAsync( 'modelsfolder/dark_forest.hdr' );
envMap.mapping = THREE.EquirectangularReflectionMapping;

skybox = new GroundedSkybox( envMap, params.height, params.radius );
skybox.position.y = params.height - 0.01;
scene.add( skybox );

// scene.environment = envMap;


const textureLoader = new THREE.TextureLoader();

// Configure texture repeat
const textureRepeat = 2;

// 1. Cache frequently used values and optimize texture loading
const loadTexture = (filename) => {
  const texture = textureLoader.load(filename);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(textureRepeat, textureRepeat);
  return texture;
};

// Replace individual texture loads with the optimized function
const textures = {
  ao: loadTexture("brown_mud_02_ao_2k.jpg"),
  roughness: loadTexture("brown_mud_02_rough_2k.jpg"),
  normal: loadTexture("brown_mud_02_nor_gl_2k.jpg"),
  normalDX: loadTexture("brown_mud_02_nor_dx_2k.jpg"),
  diffuse: loadTexture("brown_mud_02_diff_2k.jpg"),
  displacement: loadTexture("brown_mud_02_disp_2k.jpg"),
  bump: loadTexture("brown_mud_02_bump_2k.jpg"),
  arm: loadTexture("brown_mud_02_arm_2k.jpg")
};

// Create material with textures
const groundMaterial = new THREE.MeshStandardMaterial({
  map: textures.diffuse,
  normalMap: textures.normal,
  aoMap: textures.ao,
  roughnessMap: textures.roughness,
  displacementMap: textures.displacement,
  displacementScale: 0.1,
  bumpMap: textures.bump,
  bumpScale: 0.1,
  metalnessMap: textures.arm,
  envMapIntensity: 1.2,
  roughness: 0.9,
  metalness: 0.05,
  normalScale: new THREE.Vector2(1.5, 1.5),
});

// Update ground plane geometry to support aoMap and increase segment count for displacement
const groundPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500, 256, 256),
  groundMaterial
);

groundPlane.position.set(0, 0, 0);
groundPlane.rotation.x = -Math.PI / 2;
groundPlane.receiveShadow = true;
// scene.add(groundPlane);
groundPlane.castShadow = true;
groundPlane.receiveShadow = true;

// Add UV2 for ambient occlusion map
groundPlane.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(groundPlane.geometry.attributes.uv.array, 2)
);


const gltfLoader = new GLTFLoader();

gltfLoader.load(
    "abandoned_house.glb",
    (gltf) => {
      const abandonedHouse = gltf.scene;
    //   scene.add(abandonedHouse);
      abandonedHouse.position.set(8, -0.6, 5);
      abandonedHouse.scale.set(6, 6, 6);
  
      abandonedHouse.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    },
);


gltfLoader.load(
    "trees.glb", 
    (gltf) => {
        const trees = gltf.scene;
        // scene.add(trees);
        trees.position.set(25, 0, 10);
        trees.rotation.set(0, Math.PI / 3, 0);
        trees.scale.set(6, 6, 6);
        trees.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    },
);


const animate = () => {
    renderer.setAnimationLoop((time) => {
        controls.update();
        
        // Use VR camera when in VR mode, otherwise use regular camera
        if (renderer.xr.isPresenting) {
            // The VR camera will be positioned relative to the rig
            renderer.render(scene, vrCamera);
        } else {
            renderer.render(scene, camera);
        }
    });
};
animate();

// Update both cameras on window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    vrCamera.aspect = window.innerWidth / window.innerHeight;
    vrCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});













