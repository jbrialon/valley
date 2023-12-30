import * as THREE from "three";
import { gsap } from "gsap";
import Experience from "../Experience";

import vertexShader from "../../shaders/loader/vertex.glsl";
import fragmentShader from "../../shaders/loader/fragment.glsl";

export default class Loader {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.debug = this.experience.debug;
    this.resources = this.experience.resources;

    // Options
    this.options = {
      uColor: "#968677",
    };

    // Setup
    this.setGeometry();
    this.setMaterial();
    this.setMesh();

    // Debug
    // this.setDebug();
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uAlpha: {
          value: 1,
        },
        uCircleRadius: {
          value: 16,
        },
        uColor: { value: new THREE.Color(this.options.uColor) },

        uTime: { value: 0 },
        uCirclePos: {
          value: new THREE.Vector2(-1.05, 1.05),
        },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  hideLoader() {
    gsap.to(this.material.uniforms.uCircleRadius, {
      value: 0,
      duration: 4,
      ease: "expo.in",
      onComplete: () => {
        // this.destroy();
      },
    });
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Loader");
      this.debugFolder
        .add(
          {
            button: () => {
              gsap.to(this.material.uniforms.uCircleRadius, {
                value: 16,
                duration: 1.5,
                ease: "power4.inOut",
              });
            },
          },
          "button"
        )
        .name("show Loader");
      this.debugFolder
        .add(
          {
            button: () => {
              gsap.to(this.material.uniforms.uCircleRadius, {
                value: 0,
                duration: 1.5,
                ease: "power4.inOut",
                onComplete: () => {
                  // this.destroy();
                },
              });
            },
          },
          "button"
        )
        .name("hide Loader");
      this.debugFolder
        .add(this.material.uniforms.uAlpha, "value")
        .min(0)
        .max(1)
        .step(0.001)
        .name("opacity");
      this.debugFolder
        .add(this.material.uniforms.uCircleRadius, "value")
        .min(0)
        .max(20)
        .step(0.001)
        .name("circle radius");
      this.debugFolder
        .add(this.material.uniforms.uCirclePos.value, "x")
        .min(-1)
        .max(1)
        .step(0.001)
        .name("pos x");
      this.debugFolder
        .add(this.material.uniforms.uCirclePos.value, "y")
        .min(-1)
        .max(1)
        .step(0.001)
        .name("pos y");
    }
  }

  update() {
    this.material.uniforms.uTime.value = this.time.elapsedTime * 0.15;
  }

  destroy() {
    this.geometry.dispose();
    this.material.dispose();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.scene.remove(this.mesh);
  }
}
