import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

// Add these near the top of the file, after the imports
const loadingManager = new THREE.LoadingManager();
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.getElementById('progress');
const loadingText = document.getElementById('loading-text');

loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
    const progress = Math.round((itemsLoaded / itemsTotal) * 100);
    loadingText.textContent = `${progress}%`;
};

loadingManager.onLoad = function() {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
};

loadingManager.onError = function(url) {
    console.error('Error loading:', url);
    loadingText.textContent = 'Error';
};

// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

// After camera setup but before controls
camera.position.set(4, 2, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// Add VR button after renderer setup
document.body.appendChild(VRButton.createButton(renderer));

// Set up OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2.05;
controls.dampingFactor = 0.25;

// Add fog to the scene
scene.fog = new THREE.FogExp2(0xb7d1e3, 0.05);
scene.background = new THREE.Color(0xb7d1e3);

// Lights
const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xffd2b0, 2.5);
light.position.set(15, 25, 40);
scene.add(light);
light.castShadow = true;
light.shadow.mapSize.set(2048, 2048);
light.shadow.camera.far = 100;
light.shadow.camera.left = -30;
light.shadow.camera.right = 30;
light.shadow.camera.top = 30;
light.shadow.camera.bottom = -30;
light.shadow.bias = -0.001;
light.shadow.normalBias = 0.02;
light.shadow.radius = 1.5;

const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x4a4a4a, 0.4);
scene.add(hemisphereLight);

// Add subtle point lights for atmosphere
const pointLight1 = new THREE.PointLight(0xffd2b0, 0.5, 50);
pointLight1.position.set(10, 2, 10);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffd2b0, 0.5, 50);
pointLight2.position.set(-10, 2, -10);
scene.add(pointLight2);

// const shadowHelper = new THREE.CameraHelper(light.shadow.camera);
// scene.add(shadowHelper);

// const lightHelper = new THREE.DirectionalLightHelper(light);
// scene.add(lightHelper);

// Update the texture loader to use the loading manager
// Replace the existing textureLoader declaration with:
const textureLoader = new THREE.TextureLoader(loadingManager);

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
  new THREE.PlaneGeometry(50, 50, 256, 256),
  groundMaterial
);

groundPlane.position.set(0, 0, 0);
groundPlane.rotation.x = -Math.PI / 2;
groundPlane.receiveShadow = true;
scene.add(groundPlane);

// Add UV2 for ambient occlusion map
groundPlane.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(groundPlane.geometry.attributes.uv.array, 2)
);

// Update the GLTF loader to use the loading manager
// Replace the existing gltfLoader declaration with:
const gltfLoader = new GLTFLoader(loadingManager);

// Add these variables after scene setup, before the lights
const clock = new THREE.Clock();
const windStrength = 1.2;
const windFrequency = 0.3;
const treeGroups = [];

// Update the tree instances array to include all transformations
const treeInstances = [
  { 
    position: new THREE.Vector3(-5, 0, -5),
    rotation: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(1, 1, 1)
  },
  { 
    position: new THREE.Vector3(10, 0, -10),
    rotation: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(1, 1, 1)
  },
  { 
    position: new THREE.Vector3(-10, 0, 5),
    rotation: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(1, 1, 1)
  },
  { 
    position: new THREE.Vector3(5, 0, 10),
    rotation: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(1, 1, 1)
  },
  { 
    position: new THREE.Vector3(10, 0, 3),
    rotation: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(1, 1, 1)
  },
  { 
    position: new THREE.Vector3(-10, 0, 17),
    rotation: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(1, 1, 1)
  }
];

// Add this with other global variables at the top
const originalMeshes = new Map();

// 2. Create a reusable function for model loading and setup
const loadModel = (url, setupCallback) => {
  gltfLoader.load(url, (gltf) => {
    setupCallback(gltf);
  });
};

// 3. Create a reusable function for mesh traversal
const setupMeshProperties = (object) => {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      
      if (child.material instanceof THREE.MeshStandardMaterial) {
        child.material.envMapIntensity = 1.0;
        child.material.roughness = 0.9;
        child.material.metalness = 0.05;
        child.material.normalScale = new THREE.Vector2(1.5, 1.5);
      }
    }
  });
};

// 4. Optimize the animate function
const windData = {
  strength: 1.2,
  frequency: 0.3
};

// Update the wind animation function to preserve original leaf positions
function updateTreeWind(time) {
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const originalRotation = new THREE.Euler();

  treeGroups.forEach((instancedMesh) => {
    if (instancedMesh.isInstancedMesh && instancedMesh.name === "Object_13") {
      // Get the original transform for this mesh
      const originalTransform = originalMeshes.get(instancedMesh.name);
      
      for (let i = 0; i < treeInstances.length; i++) {
        // Get current instance matrix for position and scale
        instancedMesh.getMatrixAt(i, matrix);
        matrix.decompose(position, quaternion, scale);
        
        // Calculate wind effect
        const windX = Math.sin(time * windData.frequency) * 0.02 * windData.strength;
        const windZ = Math.sin(time * windData.frequency + 0.5) * 0.009 * windData.strength;
        
        // Combine original rotation with wind effect
        originalRotation.copy(originalTransform.rotation);
        originalRotation.x += windX;
        originalRotation.z += windZ;
        
        quaternion.setFromEuler(originalRotation);
        
        // Reconstruct matrix
        matrix.compose(position, quaternion, scale);
        instancedMesh.setMatrixAt(i, matrix);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;
    }
  });
}

// 5. Optimize the animation loop
let lastTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

function animate(currentTime) {
  const deltaTime = currentTime - lastTime;

  if (deltaTime > frameInterval) {
    // Update shader time
    if (customShaderMaterial) {
      customShaderMaterial.uniforms.uTime.value = currentTime * 0.001;
    }

    // Update wind animation
    if (treeGroups.length > 0) {
      updateTreeWind(clock.getElapsedTime());
    }

    controls.update();
    
    lastTime = currentTime - (deltaTime % frameInterval);
  }
}

// Replace the tick function with this VR-compatible version
function render() {
  renderer.setAnimationLoop((time) => {
    animate(time);
    renderer.render(scene, camera);
  });
}

// Replace tick() call with render()
render();

// Add error handling for model loading
const handleLoadError = (error) => {
  console.error('An error occurred while loading the model:', error);
};

// Replace the tree loading code with this updated version
gltfLoader.load(
  "trees.glb", 
  (gltf) => {
    // Store original transformations
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        originalMeshes.set(child.name, {
          position: child.position.clone(),
          rotation: child.rotation.clone(),
          scale: child.scale.clone()
        });
      }
    });

    // Create InstancedMesh for each unique mesh in the tree
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        const instancedMesh = new THREE.InstancedMesh(
          child.geometry,
          child.material,
          treeInstances.length
        );
        
        instancedMesh.name = child.name;
        instancedMesh.castShadow = true;
        instancedMesh.receiveShadow = true;

        // Set up material properties
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.envMapIntensity = 1.0;
          child.material.roughness = 0.9;
          child.material.metalness = 0.05;
          child.material.normalScale = new THREE.Vector2(1.5, 1.5);
        }

        // Get original transformations for this mesh
        const originalTransform = originalMeshes.get(child.name);
        
        // Set up each instance
        const matrix = new THREE.Matrix4();
        const tempMatrix = new THREE.Matrix4();
        
        treeInstances.forEach((instance, index) => {
          // Start with original mesh transform
          matrix.compose(
            originalTransform.position,
            new THREE.Quaternion().setFromEuler(originalTransform.rotation),
            originalTransform.scale
          );

          // Apply instance transform
          tempMatrix.compose(
            instance.position,
            new THREE.Quaternion().setFromEuler(instance.rotation),
            instance.scale
          );

          // Combine transformations
          matrix.premultiply(tempMatrix);
          
          instancedMesh.setMatrixAt(index, matrix);
        });

        instancedMesh.instanceMatrix.needsUpdate = true;
        scene.add(instancedMesh);
        treeGroups.push(instancedMesh);
      }
    });

    // Debug: Log tree structure
    console.log("Tree structure:");
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        console.log(`Mesh name: ${child.name}`);
        console.log(`Position:`, child.position);
        console.log(`Geometry center:`, child.geometry.boundingSphere?.center);
      }
    });
  },
  undefined,
  handleLoadError
);

// Add this with other global variables at the top
const mountainInstances = [
  {
    position: new THREE.Vector3(-24, 8, 0),
    rotation: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(2, 2, 2)
  },
  {
    position: new THREE.Vector3(18, 8, -25),
    rotation: new THREE.Euler(0, Math.PI * 0.3, 0),
    scale: new THREE.Vector3(1.8, 1.8, 1.8)
  },
  {
    position: new THREE.Vector3(28, 8, -15),
    rotation: new THREE.Euler(0, Math.PI * -0.2, 0),
    scale: new THREE.Vector3(2.2, 2.2, 2.2)
  },
  {
    position: new THREE.Vector3(-5, 8, -22),
    rotation: new THREE.Euler(0, Math.PI, 0),
    scale: new THREE.Vector3(1.7, 1.7, 1.7)
  }
];

// Replace the mountain loading code with this
gltfLoader.load(
  "mountain.glb",
  (gltf) => {
    // Store original mesh properties
    const originalMeshes = new Map();
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        originalMeshes.set(child.uuid, {
          position: child.position.clone(),
          rotation: child.rotation.clone(),
          scale: child.scale.clone()
        });
      }
    });

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        const instancedMesh = new THREE.InstancedMesh(
          child.geometry,
          child.material,
          mountainInstances.length
        );
        
        instancedMesh.castShadow = true;
        instancedMesh.receiveShadow = true;

        // Get original transformations
        const originalTransform = originalMeshes.get(child.uuid);
        
        // Set up each instance
        const matrix = new THREE.Matrix4();
        const tempMatrix = new THREE.Matrix4();
        
        mountainInstances.forEach((instance, index) => {
          // Start with original mesh transform
          matrix.compose(
            originalTransform.position,
            new THREE.Quaternion().setFromEuler(originalTransform.rotation),
            originalTransform.scale
          );

          // Create instance transform
          tempMatrix.compose(
            instance.position,
            new THREE.Quaternion().setFromEuler(instance.rotation),
            instance.scale
          );

          // Combine transformations
          matrix.premultiply(tempMatrix);
          
          instancedMesh.setMatrixAt(index, matrix);
        });

        instancedMesh.instanceMatrix.needsUpdate = true;
        scene.add(instancedMesh);
      }
    });
  },
  undefined,
  handleLoadError
);

gltfLoader.load(
  "abandoned_house.glb",
  (gltf) => {
    const abandonedHouse = gltf.scene;
    scene.add(abandonedHouse);
    abandonedHouse.position.set(-4, -0.6, -1);

    abandonedHouse.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  },
  undefined,
  handleLoadError
);


gltfLoader.load(
  "grass.glb",
  (gltf) => {
    const grass = gltf.scene;
    // scene.add(grass);
    grass.position.set(-4, -0.6, -1);

    grass.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  },
  undefined,
  handleLoadError
);

gltfLoader.load(
  "mystical_portal.glb",
  (gltf) => {
    const mysticalPortal = gltf.scene;
    scene.add(mysticalPortal);
    mysticalPortal.scale.set(4.5, 4.5, 4.5);
    mysticalPortal.rotation.y = Math.PI / 4;
    mysticalPortal.position.set(-13.5, 1.805, -10);

    mysticalPortal.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  },
  undefined,
  handleLoadError
);

const circleGeometry = new THREE.CircleGeometry(1.4, 32);

// Create custom shader material
const customShaderMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  transparent: true,
  uniforms: {
    uTime: { value: 0 },
    uTexture: { value: new THREE.TextureLoader().load("tex.png") },
  },
  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uTime;
    varying vec2 vUv;
    
    // Simplex 2D noise function
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // Create noise-based distortion
      float noise = snoise(vUv * 5.0 + uTime * 0.2) * 0.1;
      vec2 distortedUV = vUv + vec2(noise);
      
      // Sample the texture
      vec4 texColor = texture2D(uTexture, distortedUV);
      
      // Use the texture's luminance as alpha
      float alpha = (texColor.r + texColor.g + texColor.b) / 3.0;
      
      // Add some noise to the alpha
      alpha *= 1.0 + noise * 0.5;
      
      gl_FragColor = vec4(texColor.rgb, alpha);
    }
  `,
});

const circleMesh = new THREE.Mesh(circleGeometry, customShaderMaterial);
scene.add(circleMesh);
circleMesh.scale.set(1.5, 1.5, 1.5);
circleMesh.position.set(-13.5, 1.8, -10.3);
circleMesh.rotation.y = Math.PI / 4;

// 7. Optimize resize handler with debouncing
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

const handleResize = debounce(() => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}, 250);

window.addEventListener("resize", handleResize);

function cleanup() {
  // Dispose of geometries
  groundPlane.geometry.dispose();
  circleGeometry.dispose();

  // Dispose of materials
  groundMaterial.dispose();
  customShaderMaterial.dispose();

  // Dispose of textures
  Object.values(textures).forEach(texture => texture.dispose());

  // Remove event listeners
  window.removeEventListener("resize", handleResize);

  // Stop XR animation loop
  renderer.setAnimationLoop(null);
}

// Export necessary functions and variables if needed
export { scene, camera, renderer, cleanup };