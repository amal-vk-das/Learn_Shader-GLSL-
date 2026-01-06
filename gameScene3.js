import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

// Create scene, camera, and renderer only once
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  powerPreference: "high-performance",
  stencil: false,
  depth: true
});

// Move composer declaration to top level
let composer;

// Initial setup
const initScene = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  
  // Set initial non-VR camera position
  camera.position.set(180, 15, -85);
  
  // Enhanced renderer settings
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Scene settings
  scene.fog = new THREE.FogExp2(0x8ba7c2, 0.002);
  scene.background = new THREE.Color(0x8ba7c2);

  // Enable WebXR
  renderer.xr.enabled = true;
  
  // Add VR session start listener to adjust camera position
  renderer.xr.addEventListener('sessionstart', () => {
    camera.position.set(100, 2, 20);
  });
  
  // Add VR session end listener to reset camera position
  renderer.xr.addEventListener('sessionend', () => {
    camera.position.set(180, 15, -85);
  });
  
  document.body.appendChild(VRButton.createButton(renderer));

  // Lights
  setupLights();

  // Add VR controllers
  setupVRControllers();
};

// Setup controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting setup
const setupLights = () => {
  // Ambient light for overall scene brightness
  const ambientLight = new THREE.AmbientLight(0x3366ff, 0.4);
  scene.add(ambientLight);

  // Main directional light (sun-like)
  const directionalLight = new THREE.DirectionalLight(0x7fbfff, 3);
  directionalLight.position.set(-70, 200, -150);
  directionalLight.target.position.set(120, 0, 0);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(4096, 4096);
  directionalLight.shadow.camera.far = 350;
  directionalLight.shadow.camera.left = -120;
  directionalLight.shadow.camera.right = 120;
  directionalLight.shadow.camera.top = 120;
  directionalLight.shadow.camera.bottom = -120;
  directionalLight.shadow.bias = -0.001;
  scene.add(directionalLight);

  // Add bioluminescent point lights
  const createBioLight = (color, intensity, position) => {
    const light = new THREE.PointLight(color, intensity, 50);
    light.position.set(...position);
    scene.add(light);
  };

  // Add multiple bioluminescent lights
  createBioLight(0x00ffff, 2, [80, 5, -10]);  // Blue crystal light
  createBioLight(0x4dff4d, 1.5, [140, 2, 0]); // Green mushroom light
  createBioLight(0x4dff4d, 1.5, [70, 2, 35]); // Green mushroom light
  createBioLight(0x4dff4d, 1.5, [105, 2, -60]); // Green mushroom light
};

// Load models
const loadModels = () => {
  const loader = new GLTFLoader();
  
  // Load mountains with enhanced scale
  loader.load("./models1/mountains.glb", (gltf) => {
    const mountains = gltf.scene;
    mountains.castShadow = true;
    mountains.receiveShadow = true;
    mountains.scale.set(1.2, 1.2, 1.2);
    scene.add(mountains);
  });

  // Enhanced tree positions for more natural placement
  const treePositions = [
    { pos: [165, 0, 20], scale: [13, 25, 13] },
    { pos: [110, 0, 30], scale: [18, 28, 18] },
    // { pos: [140, 0, -20], scale: [15, 22, 15] },
    // { pos: [90, 0, 15], scale: [16, 24, 16] }
  ];

  treePositions.forEach(({pos, scale}) => {
    loader.load("./models1/tree.glb", (gltf) => {
      const tree = gltf.scene;
      tree.position.set(...pos);
      tree.scale.set(...scale);
      tree.castShadow = true;
      tree.receiveShadow = true;
      scene.add(tree);
    })
  });

  // Load and scatter more plants with variation
  loader.load("./models1/plants.glb", (gltf) => {
    for (let i = 0; i < 40; i++) {
      const plants = gltf.scene.clone();
      plants.position.set(
        100 + Math.random() * 50 - 25,
        -2.2 + Math.random() * 0.5,
        Math.random() * 50 - 25
      );
      plants.rotation.y = Math.random() * Math.PI * 2;
      const scale = 45 + Math.random() * 15;
      plants.scale.set(scale, scale, scale);
      plants.castShadow = true;
      plants.receiveShadow = true;
      scene.add(plants);
    }
  });

  // Load and scatter violet flowers (uncomment and enhance)
  loader.load("./models1/violetflower.glb", (gltf) => {
    const template = gltf.scene;
    for (let i = 0; i < 200; i++) {
      const violetflower = template.clone();
      violetflower.position.set(
        40 + Math.random() * 140,
        -2.2 + Math.random() * 0.6,
        -80 + Math.random() * 140
      );
      violetflower.rotation.set(
        Math.random() * 0.3 - 0.15,
        Math.random() * Math.PI * 2,
        Math.random() * 0.3 - 0.15
      );
      const scale = 40 + Math.random() * 15;
      violetflower.scale.set(scale, scale, scale);
      violetflower.castShadow = true;
      violetflower.receiveShadow = true;
      scene.add(violetflower);
    }
  });

  // Load wood plants
  loader.load("./models1/woodplants.glb", (gltf) => {
    const woodplants = gltf.scene;
    woodplants.position.set(180, 3, -10);
    woodplants.scale.set(0.05, 0.05, 0.05);
    woodplants.castShadow = true;
    woodplants.receiveShadow = true;
    scene.add(woodplants);
    woodplants.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        if(child.material){
          child.material.emissiveIntensity = 14.0;
          child.renderOrder = 1;
        }
      }
    });
  });

  // Enhanced crystal settings
  loader.load("./models1/sky_blue_crystal.glb", (gltf) => {
    const sky_blue_crystal = gltf.scene;
    sky_blue_crystal.position.set(70, 8, -10);
    sky_blue_crystal.scale.set(6, 6, 6);
    sky_blue_crystal.castShadow = true;
    sky_blue_crystal.receiveShadow = true;
    sky_blue_crystal.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        if(child.material){
          child.material.emissiveIntensity = 8.0;
        }
      }
    });
    // Add crystal glow
    const crystalLight = new THREE.PointLight(0x00ffff, 2, 30);
    crystalLight.position.copy(sky_blue_crystal.position);
    scene.add(crystalLight);
    scene.add(sky_blue_crystal);
  });

  // loader.load("./models1/mushroomtree.glb", (gltf) => {
  //   const glowingmushroom = gltf.scene;
  //   glowingmushroom.position.set(110, 20, 50);
  //   glowingmushroom.scale.set(13, 13, 13);
  //   glowingmushroom.castShadow = true;
  //   glowingmushroom.receiveShadow = true;
  //   scene.add(glowingmushroom);
  //   glowingmushroom.traverse(function(child) {
  //     if (child instanceof THREE.Mesh) {
  //       if(child.material){
  //         child.material.emissiveIntensity = 50.0;
  //         child.renderOrder = 1;
  //       }
  //     }
  //   });
  // });

  loader.load("./models1/glowingmushroom.glb", (gltf) => {
    const glowingmushroom2 = gltf.scene;
    glowingmushroom2.position.set(140, 0, 5);
    glowingmushroom2.scale.set(10, 10, 10);
    glowingmushroom2.castShadow = true;
    glowingmushroom2.receiveShadow = true;
    scene.add(glowingmushroom2);
    glowingmushroom2.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        if(child.material){
          child.material.emissiveIntensity = 50.0;
          child.renderOrder = 1;
        }
      }
    });
  });

  loader.load("./models1/glowingmushroom.glb", (gltf) => {
    const glowingmushroom3 = gltf.scene;
    glowingmushroom3.position.set(70, 0, 35);
    glowingmushroom3.scale.set(10, 10, 10);
    glowingmushroom3.castShadow = true;
    glowingmushroom3.receiveShadow = true;
    scene.add(glowingmushroom3);
    glowingmushroom3.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        if(child.material){
          child.material.emissiveIntensity = 50.0;
          child.renderOrder = 1;
        }
      }
    });
  });

  loader.load("./models1/glowingmushroom.glb", (gltf) => {
    const glowingmushroom4 = gltf.scene;
    glowingmushroom4.position.set(105, 0, -60);
    glowingmushroom4.scale.set(10, 10, 10);
    glowingmushroom4.castShadow = true;
    glowingmushroom4.receiveShadow = true;
    scene.add(glowingmushroom4);
    glowingmushroom4.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        if(child.material){
          child.material.emissiveIntensity = 50.0;
          child.renderOrder = 1;
        }
      }
    });
  });

};



// Update post-processing setup
const initPostProcessing = () => {
  const renderScene = new RenderPass(scene, camera);
  
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.3,    // Reduced bloom strength
    0.9,    // Reduced radius
    0.2     // Reduced threshold
  );
  
  composer = new EffectComposer(renderer);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for better performance
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  // Ensure proper WebXR compatibility
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local');
};

// Add VR controllers setup
const setupVRControllers = () => {
  const controllerModelFactory = new XRControllerModelFactory();

  // Setup controller 0
  const controller0 = renderer.xr.getController(0);
  scene.add(controller0);

  const controllerGrip0 = renderer.xr.getControllerGrip(0);
  controllerGrip0.add(controllerModelFactory.createControllerModel(controllerGrip0));
  scene.add(controllerGrip0);

  // Setup controller 1
  const controller1 = renderer.xr.getController(1);
  scene.add(controller1);

  const controllerGrip1 = renderer.xr.getControllerGrip(1);
  controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
  scene.add(controllerGrip1);
};

// Update animate function to handle both VR and non-VR rendering
const animate = () => {
  renderer.setAnimationLoop(() => {
    controls.update();
    
    // Use composer for non-VR mode, direct renderer for VR mode
    if (renderer.xr.isPresenting) {
      renderer.render(scene, camera);
    } else {
      composer.render();
    }
  });
};

// Update handleResize to consider XR
const handleResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  if (!renderer.xr.isPresenting) {
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    composer.setSize(width, height);
    composer.setPixelRatio(window.devicePixelRatio);
  }
};

// Initialize and start the application
const init = () => {
  initScene();
  initPostProcessing();
  loadModels();
  animate();
  window.addEventListener("resize", handleResize);
};

init();
