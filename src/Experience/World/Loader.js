import * as THREE from "three";
import { gsap } from "gsap";
import Experience from "../Experience";

import vertexShader from "../../shaders/loader/vertex.glsl";
import fragmentShader from "../../shaders/loader/fragment.glsl";

export default class Loader {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.debug = this.experience.debug;
    this.resources = this.experience.resources;

    // Options
    this.options = {
      uColor: "#968677",
    };

    // Debug

    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("loader mask");
      this.debugFolder.close();
    }

    // Setup
    this.maskTexture = this.resources.items.transitionTexture;

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(2, 2, 32, 32);
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uAlpha: { value: 1 },
        uColor: { value: new THREE.Color(this.options.uColor) },
        uMaskTexture: { value: this.maskTexture },
        uStrength: {
          value: 1,
        },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("loader mask");
      this.debugFolder
        .add(this.material.uniforms.uStrength, "value")
        .min(0)
        .max(1)
        .step(0.01)
        .name("blend");
    }
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    // this.mesh.rotation.x = -Math.PI * 0.5;
    this.scene.add(this.mesh);
  }

  hideLoader() {
    gsap.to(this.material.uniforms.uStrength, {
      duration: 3,
      value: 0,
      ease: "power4.inOut",
      onComplete: () => {
        // this.destroy();
      },
    });
  }

  destroy() {
    this.geometry.dispose();
    this.material.dispose();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.scene.remove(this.mesh);
  }
}
