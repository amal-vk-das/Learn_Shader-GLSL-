import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// renderer.setClearColor("black");

camera.position.z = 5;

renderer.render(scene, camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// const loader = new GLTFLoader();
// loader.load("portal.glb", (gltf) => {
//   const portal = gltf.scene;
//   scene.add(portal);
//   portal.scale.set(12, 12, 12);
//   portal.position.set(-0.3, -5, -8);
// });

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

const circleGeometry = new THREE.CircleGeometry(1.4, 32);

// Create custom shader material
const customShaderMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  transparent: true,
  uniforms: {
    uTime: { value: 0 },
    uTexture: { value: new THREE.TextureLoader().load("tex.png") }
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
  `
});

const circleMesh = new THREE.Mesh(circleGeometry, customShaderMaterial);
scene.add(circleMesh);

renderer.render(scene, camera);

const animate = () => {
  window.requestAnimationFrame(animate);
  
  // Update the time uniform for the shader animation
  customShaderMaterial.uniforms.uTime.value = performance.now() * 0.001;
  
  renderer.render(scene, camera);
  controls.update();
};

animate();

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
