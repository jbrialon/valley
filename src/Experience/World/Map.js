import * as THREE from "three";
import Experience from "../Experience";

import vertexShader from "../../Shaders/Map/vertex.glsl";
import fragmentShader from "../../Shaders/Map/fragment.glsl";

export default class Map {
  constructor() {
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.resources = this.experience.resources;

    // Options
    this.options = {};

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Map");
      this.debugObject = {
        uColorA: "#dad6ca",
        uColorB: "#c8c6b7",
      };
    }

    // Setup
    this.resource = this.resources.items.mapModel;

    this.setMaterial();
    this.setModel();

    // Debug
    this.setDebug();
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uAlpha: { value: 1 },
        uColorA: { value: new THREE.Color(this.debugObject.uColorA) }, // terrain
        uColorB: { value: new THREE.Color(this.debugObject.uColorB) }, // line
        uContourFrequency: { value: 0.05 },
        uContourWidth: { value: 0.005 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
  }

  setModel() {
    this.model = this.resource.scene;
    // this.material = new THREE.MeshStandardMaterial({ wireframe: true });

    console.log(this.model);
    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = this.material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.scene.add(this.model);
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder
        .addColor(this.debugObject, "uColorA")
        .name("Terrain Color")
        .onChange(() => {
          this.material.uniforms.uColorA.value.set(this.debugObject.uColorA);
        });
      this.debugFolder
        .addColor(this.debugObject, "uColorB")
        .name("Line Color")
        .onChange(() => {
          this.material.uniforms.uColorB.value.set(this.debugObject.uColorB);
        });
      this.debugFolder
        .add(this.material.uniforms.uContourFrequency, "value")
        .min(0)
        .max(1)
        .step(0.001)
        .name("Contour Frequency");
      this.debugFolder
        .add(this.material.uniforms.uContourWidth, "value")
        .min(0)
        .max(0.05)
        .step(0.001)
        .name("Contour Width");
    }
  }

  update() {
    // map animation
    // this.animation.mixer.update(this.time.delta * 0.001);
  }
}
