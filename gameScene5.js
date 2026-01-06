import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import cloudShader from './shaders/cloudShader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87CEEB); // Sky blue background
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

camera.position.set(0, 40, 40);

// scene.fog = new THREE.Fog(0x87CEEB, 10, 100);

const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshBasicMaterial();
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.set(0, 0, 0);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  

const gltfLoader = new GLTFLoader();

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

gltfLoader.load('19862.gltf', (gltf) => {
  const cloud = gltf.scene;
  scene.add(cloud);
  // cloud.traverse((child) => {
  //   if (child instanceof THREE.Mesh) {
  //     child.material.wireframe = true;
  //   }
  // });
});

renderer.sortObjects = true;

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
};

animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
