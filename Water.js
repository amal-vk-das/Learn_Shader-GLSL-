import * as THREE from 'three';
import waterVertexShader from './shaders/water.vert?raw';
import waterFragmentShader from './shaders/water.frag?raw';

export class Water extends THREE.Mesh {
  constructor(options = {}) {
    super();

    this.material = new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.9 },
        uEnvironmentMap: { value: options.environmentMap },
        uWavesAmplitude: { value: 0.025 },
        uWavesFrequency: { value: 1.07 },
        uWavesPersistence: { value: 0.3 },
        uWavesLacunarity: { value: 2.18 },
        uWavesIterations: { value: 8 },
        uWavesSpeed: { value: 0.4 },
        uTroughColor: { value: new THREE.Color('#29d9e7') },
        uSurfaceColor: { value: new THREE.Color('#29e7ad') },
        uPeakColor: { value: new THREE.Color('#29c7e7') },
        uPeakThreshold: { value: 0.08 },
        uPeakTransition: { value: 0.05 },
        uTroughThreshold: { value: -0.01 },
        uTroughTransition: { value: 0.15 },
        uFresnelScale: { value: 0.8 },
        uFresnelPower: { value: 0.5 }
      },
      transparent: true,
      depthTest: true,
      side: THREE.DoubleSide
    });
 

    this.geometry = new THREE.PlaneGeometry(110, 600, options.resolution || 1024, options.resolution || 1024);
    this.rotation.x = Math.PI * 0.5;
    this.position.set(
      options.position?.x || 0,
      options.position?.y || 0,
      options.position?.z || 0
    );
  }

  update(time) {
    this.material.uniforms.uTime.value = time;
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z);
  }

  setWavesAmplitude(amplitude) {
    this.material.uniforms.uWavesAmplitude.value = amplitude;
  }

  setWavesFrequency(frequency) {
    this.material.uniforms.uWavesFrequency.value = frequency;
  }

  setSurfaceColor(color) {
    this.material.uniforms.uSurfaceColor.value.set(color);
  }

  setTroughColor(color) {
    this.material.uniforms.uTroughColor.value.set(color);
  }

  setPeakColor(color) {
    this.material.uniforms.uPeakColor.value.set(color);
  }
}