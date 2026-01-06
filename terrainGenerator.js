import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.set(0, 20, 50); 

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light for better terrain visibility
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 20, 30);
scene.add(directionalLight);

// Create texture loader and load height map
const textureLoader = new THREE.TextureLoader();
const heightMap = textureLoader.load('terrain.jpg', (texture) => {
    // This callback runs when the texture is loaded
    const geometry = new THREE.PlaneGeometry(50, 50, 1024, 1024);

    const diffuseMap = textureLoader.load('needlesdiffuse.jpg');
    diffuseMap.colorSpace = THREE.SRGBColorSpace;
    diffuseMap.wrapS = THREE.RepeatWrapping;
    diffuseMap.wrapT = THREE.RepeatWrapping;
    diffuseMap.repeat.set(50, 50);

    const material = new THREE.MeshStandardMaterial({
        // color: 0x3c8f3c,
        wireframe: false,
        displacementMap: texture,
        displacementScale: 9, // Increased from 10 to 20 for more pronounced height
        roughness: 0.8,
        map: diffuseMap,
        // Add these for better detail
        flatShading: true,
        side: THREE.DoubleSide
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    
    // Adjust camera for better view of the terrain
    camera.position.set(0, 30, 50);
    camera.lookAt(0, 0, 0);
    
    scene.add(terrain);
});

// // Adjust directional light for better shadows
// directionalLight = scene.children.find(child => child instanceof THREE.DirectionalLight);
// if (directionalLight) {
//     directionalLight.position.set(5, 15, 5);
//     directionalLight.intensity = 1.5;
// }

const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
}

animate();


window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
