import * as THREE from "three";
import { DirectionalLightHelper } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Water } from "./Water.js";
import * as dat from "dat.gui";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(10, 20, 100);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLight);
directionalLight.position.set(25, 10, 30);

// const directionalLightHelper = new DirectionalLightHelper(directionalLight, 5);
// scene.add(directionalLightHelper);

// const directionalLightHelper2 = new DirectionalLightHelper(directionalLight2, 5);
// scene.add(directionalLightHelper2);


const gltfLoader = new GLTFLoader();

gltfLoader.load('./AvatarModels/avatar_scene-v1.glb', (gltf) => {
  const forest = gltf.scene;
  forest.scale.set(45, 45, 45);
  forest.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if(child.material) {
        if (child.material.name === "shinee_stone") {
          child.material.emissiveIntensity = 100;  // Set emission to 0 for P2_Earth__0
        } else {
          child.material.emissiveIntensity = 100;  // Keep original emission for other meshes
        }
      }
    }
  });
  scene.add(forest);
});

let water;
const clock = new THREE.Clock();

water = new Water({
  // environmentMap,
  position: { x: 20, y: 4, z:-120 },
});
scene.add(water)

// Example controls for water properties
// const gui = new dat.GUI();
// const waterFolder = gui.addFolder('Water Properties');
// waterFolder.add(water.material.uniforms.uWavesAmplitude, 'value', 0, 0.1).name('Waves Amplitude');
// waterFolder.add(water.material.uniforms.uWavesFrequency, 'value', 0, 2).name('Waves Frequency');
// waterFolder.addColor({ color: '#29e7ad' }, 'color').name('Surface Color').onChange((value) => {
//   water.setSurfaceColor(value);
// });
// waterFolder.addColor({ color: '#29d9e7' }, 'color').name('Trough Color').onChange((value) => {
//   water.setTroughColor(value);
// });
// waterFolder.addColor({ color: '#29c7e7' }, 'color').name('Peak Color').onChange((value) => {
//   water.setPeakColor(value);
// });
// waterFolder.open();

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  if (water) {
    water.update(clock.getElapsedTime());
  }
};

animate();

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
