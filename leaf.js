import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Add renderer to document
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Create function to apply moving texture effect
function applyMovingTextureEffect(model, speed = 0.01, amplitude = 0.05) {
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform sampler2D baseTexture;
    uniform sampler2D normalTexture;
    uniform sampler2D emissionTexture;
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      // uv.x += sin(time) * ${amplitude.toFixed(3)};


      // Gradually reduce movement based on vertical position
      float movementFactor = smoothstep(0.0, 1.0, vUv.y);
      uv.x += sin(time) * ${amplitude.toFixed(3)} * movementFactor;

      
      vec4 texColor = texture2D(baseTexture, uv);
      
      // More aggressive alpha testing for cleaner edges
      if (texColor.a < 0.5) discard;

      vec3 finalColor = texColor.rgb;

      // Only do normal and emission processing if textures exist
      #ifdef USE_NORMAL_MAP
        vec3 normalMap = texture2D(normalTexture, uv).rgb * 2.0 - 1.0;
        normalMap = normalize(normalMap);
        
        // Lighting calculation (simple directional light effect)
        vec3 lightDir = normalize(vec3(0.3, 1.0, 0.5));
        float lightIntensity = max(dot(normalMap, lightDir), 0.0);
        finalColor = texColor.rgb * lightIntensity;
      #endif

      #ifdef USE_EMISSION_MAP
        vec4 emissionColor = texture2D(emissionTexture, uv);
        float emissionIntensity = 10.0; // Adjustable emission intensity
        finalColor += emissionColor.rgb * emissionIntensity;
      #endif
      
      // Ensure fully opaque output for non-discarded pixels
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0 },
      baseTexture: { value: null },
      emissionTexture: { value: null },
      normalTexture: { value: null }
    },
    transparent: false,
    side: THREE.DoubleSide,
    depthWrite: true,
    depthTest: true,
    alphaTest: 0.5,
    defines: {
      USE_NORMAL_MAP: false,
      USE_EMISSION_MAP: false
    }
  });

  // Apply shader material to all mesh children
  model.traverse((child) => {
    if (child.isMesh) {
      if(child.material.name === "leaves") {
        if (child.material.map) {
          shaderMaterial.uniforms.baseTexture.value = child.material.map;
        }
        if (child.material.emissiveMap) {
          shaderMaterial.uniforms.emissionTexture.value = child.material.emissiveMap;
          shaderMaterial.defines.USE_EMISSION_MAP = true;
        }
        if (child.material.normalMap) {
          shaderMaterial.uniforms.normalTexture.value = child.material.normalMap;
          shaderMaterial.defines.USE_NORMAL_MAP = true;
        }
        shaderMaterial.needsUpdate = true;
        child.material = shaderMaterial;  // Only change material for leaves
      }
      // Stem material remains unchanged
    }
  });

  return shaderMaterial;
}

const loader = new GLTFLoader();
let movingMaterial;

// Load model and apply effect
loader.load('1.glb', (gltf) => {
  const model = gltf.scene;
  model.position.set(0, 0, 0);
  model.scale.set(1, 1, 1);
  model.rotation.set(0, 0, 0);
  
  // Apply the effect and store the returned material
  movingMaterial = applyMovingTextureEffect(model);
  
  scene.add(model);
});

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

const animate = () => {
  requestAnimationFrame(animate);
  
  // Update shader time uniform if material exists
  if (movingMaterial) {
    movingMaterial.uniforms.time.value += 0.01;
  }
  
  renderer.render(scene, camera);
  controls.update();
};

animate();

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
