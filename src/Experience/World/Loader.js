import * as THREE from "three/webgpu";
import { uniform, color, vec4, positionLocal } from "three/tsl";

import { gsap } from "gsap";
import Experience from "../Experience";

export default class Loader {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.renderer = this.experience.renderer;

    // Options
    this.options = {
      uColor: color(this.renderer.options.clearColor),
      uAlpha: uniform(1),
    };

    // Setup
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
  }

  setMaterial() {
    this.material = new THREE.NodeMaterial();
    this.material.depthTest = false;
    this.material.depthWrite = false;
    this.material.transparent = true;

    this.material.vertexNode = vec4(positionLocal, 1.0);

    this.material.fragmentNode = vec4(this.options.uColor, this.options.uAlpha);
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 999; // Render on top of everything
    this.scene.add(this.mesh);
  }

  hideLoader() {
    gsap.to(this.options.uAlpha, {
      duration: 3,
      value: 0,
      ease: "power4.inOut",
      onComplete: () => {
        this.destroy();
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
