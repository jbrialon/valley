import * as THREE from "three";
import { gsap } from "gsap";
import Experience from "../Experience";

import vertexShader from "../../shaders/loader/vertex.glsl";
import fragmentShader from "../../shaders/loader/fragment.glsl";

export default class Loader {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;
    this.time = this.experience.time;
    this.debug = this.experience.debug;
    this.manager = this.experience.manager;

    // Options
    this.options = {
      uColor: 0xb9a998,
      uBorderColor: 0x5a5444,
      uCirclePos: new THREE.Vector2(0.804, 0.765),
    };

    // Setup
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.initEvents();

    // Debug
    this.setDebug();
  }

  initEvents() {
    this.manager.on("loader-hide", this.hideLoader.bind(this));
    this.manager.on("loader-tutorial-hide", this.hideLoaderTutorial.bind(this));
    this.manager.on(
      "loader-tutorial-one",
      this.revealTutorialStepOne.bind(this)
    );
    this.manager.on(
      "loader-tutorial-two",
      this.revealTutorialStepTwo.bind(this)
    );
    this.manager.on(
      "loader-tutorial-four",
      this.revealTutorialStepFour.bind(this)
    );
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: new THREE.Uniform(0),

        uAlpha: new THREE.Uniform(1),
        uCircleRadius: new THREE.Uniform(0),
        uScreenRatio: new THREE.Uniform(this.sizes.width / this.sizes.height),
        uColor: new THREE.Uniform(new THREE.Color(this.options.uColor)),
        uBorderColor: new THREE.Uniform(
          new THREE.Color(this.options.uBorderColor)
        ),
        uCirclePos: new THREE.Uniform(this.options.uCirclePos),
        uBorderWidth: new THREE.Uniform(0.01),
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(-4.29, 1.56, -9.07);
    this.scene.add(this.mesh);
  }

  hideLoaderTutorial(callback) {
    gsap.to(this.material.uniforms.uCircleRadius, {
      value: 12,
      duration: 1.5,
      ease: "power4.inOut",
      onStart: () => {
        this.manager.trigger("ui-title-hide");
      },
      onComplete: () => {
        if (callback && typeof callback === "function") {
          callback();
        }
      },
    });
  }

  revealTutorialStepOne(callback) {
    this.material.uniforms.uCirclePos.value = new THREE.Vector2(0.5, 0.5);
    gsap.to(this.material.uniforms.uCircleRadius, {
      value: 14,
      duration: 1.5,
      ease: "power4.inOut",
      onComplete: () => {
        if (callback && typeof callback === "function") {
          callback();
        }
      },
    });
  }

  revealTutorialStepTwo(callback) {
    (this.material.uniforms.uCirclePos.value = new THREE.Vector2(0.804, 0.765)),
      gsap.to(this.material.uniforms.uCircleRadius, {
        value: 0.23,
        duration: 1.5,
        ease: "power4.inOut",
        onComplete: () => {
          if (callback && typeof callback === "function") {
            callback();
          }
        },
      });
  }

  revealTutorialStepFour(callback) {
    this.mesh.position.set(0.08, 1.89, -7.57);
    this.material.uniforms.uCirclePos.value = new THREE.Vector2(0.485, 0.551);

    gsap.to(this.material.uniforms.uCircleRadius, {
      value: 0.07,
      duration: 1.5,
      ease: "power4.inOut",
      onComplete: () => {
        if (callback && typeof callback === "function") {
          callback();
        }
      },
    });
  }

  hideLoader(callback) {
    this.material.uniforms.uCirclePos.value = new THREE.Vector2(0.5, 0.5);
    gsap.to(this.material.uniforms.uCircleRadius, {
      value: 14,
      delay: 0.1,
      duration: 2.5,
      ease: "power4.inOut",
      onComplete: () => {
        this.manager.trigger("loader-hidden");
        if (callback && typeof callback === "function") {
          callback();
        }
        if (this.manager.getTutorialStep() === 4) {
          this.destroy();
        }
      },
    });
  }

  hideLoaderTutorial(callback) {
    gsap.to(this.material.uniforms.uCircleRadius, {
      value: 14,
      duration: 1.5,
      ease: "power4.inOut",
      onComplete: () => {
        if (callback && typeof callback === "function") {
          callback();
        }
        if (this.manager.getTutorialStep() === 4) {
          this.destroy();
        }
      },
    });
  }

  resize() {
    this.material.uniforms.uScreenRatio.value =
      this.sizes.width / this.sizes.height;
  }

  update() {
    this.material.uniforms.uTime.value = this.time.elapsedTime * 0.5;
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Loader");
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
        .add(this.options.uCirclePos, "x")
        .min(0)
        .max(1)
        .step(0.001)
        .name("pos x")
        .onChange(() => {
          this.material.uniforms.uCirclePos.value.x = this.options.uCirclePos.x;
        });
      this.debugFolder
        .add(this.options.uCirclePos, "y")
        .min(0)
        .max(1)
        .step(0.001)
        .name("pos y")
        .onChange(() => {
          this.material.uniforms.uCirclePos.value.y = this.options.uCirclePos.y;
        });
    }
  }

  destroy() {
    this.geometry.dispose();
    this.material.dispose();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.scene.remove(this.mesh);
    if (this.debug.active) {
      this.debugFolder.destroy();
    }
  }
}
