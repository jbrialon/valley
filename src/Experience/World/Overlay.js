import * as THREE from "three";
import { gsap } from "gsap";
import Experience from "../Experience";

import overlayMaterial from "../Materials/OverlayMaterial";

import scenes from "../Data/scenes.js";

export default class Overlay {
  constructor(options) {
    this.experience = new Experience();
    this.options = options;
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;
    this.time = this.experience.time;
    this.manager = this.experience.Manager;
    this.resources = this.experience.resources;

    // Options
    // this.options = {
    //   uLineColor: "#53524c", // #74675e
    //   uColorOne: "#f4814a", // #6a5e52
    //   uColorTwo: "#eda17f",
    //   uColorThree: "#e45221",
    //   uColorNumber: 3,
    // };

    // Setup
    this.overlayData = scenes[this.options.name];
    this.resource = this.resources.items.mapModel;
    this.maskTexture = this.options.uMaskTexture
      ? this.resources.items[this.options.uMaskTexture].clone()
      : "";

    this.terrainMaterial = overlayMaterial({
      uAlpha: this.options.uAlpha,
      uStrength: this.options.uStrength,
      uPixelRatio: this.sizes.pixelRatio,
      uContourWidth: 1,
      uColorNumber: this.options.uColorNumber,
      uContourFrequency: this.options.uContourFrequency,
      uLineColor: this.options.uLineColor,
      uColorOne: this.options.uColorOne,
      uColorTwo: this.options.uColorTwo,
      uColorThree: this.options.uColorThree,
      uCirclePos: this.options.uCirclePos,
      uMaskTexture: this.maskTexture,
    });

    // Setup
    this.setModel();
    this.initEvents();

    // Debug
    this.setDebug();
  }

  setModel() {
    this.model = this.resource.scene.clone();

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name === "map") {
        child.material = this.terrainMaterial;
      } else if (child.name !== "Scene") {
        child.visible = false;
      }
    });

    this.model.position.y = this.options.offsetPosY;
    this.scene.add(this.model);
  }

  initEvents() {
    this.manager.on("onMarkerClick", (name) => {
      if (name === "Syabru_Besi" && this.options.name === "day1") {
        this.revealOverlay();
      } else if (name === "Pairo" && this.options.name === "day2") {
        this.revealOverlay();
      } else if (name === "Sing_Gomba" && this.options.name === "day3") {
        this.revealOverlay();
      } else if (name === "Tserko_Ri" && this.options.name === "day3") {
        this.revealOverlay();
      }
    });

    this.manager.on("cameraPositionChanged", (key) => {
      if (this.options.name === key) {
        // gsap.fromTo(
        //   this.terrainMaterial.uniforms.uStrength,
        //   {
        //     value: 0.3,
        //   },
        //   {
        //     duration: 6,
        //     value: 0.9,
        //     ease: "power4.inOut",
        //   }
        // );
        // } else {
        //   this.terrainMaterial.uniforms.uAlpha.value = 0;
      }
    });
  }

  revealOverlay() {
    gsap.fromTo(
      this.terrainMaterial.uniforms.uAlpha,
      {
        value: 0,
      },
      {
        duration: 3,
        value: 1,
        ease: "power4.inOut",
      }
    );
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.debugOverlayFolder.addFolder(
        this.overlayData.name ? this.overlayData.name : this.options.name
      );
      this.debugFolder.close();

      this.debugFolder
        .add(this.terrainMaterial.uniforms.uAlpha, "value")
        .min(0)
        .max(1)
        .step(0.01)
        .name("Opacity");
      this.debugFolder
        .add(this.terrainMaterial.uniforms.uStrength, "value")
        .min(0)
        .max(1)
        .step(0.01)
        .name("Blend");
      this.debugFolder
        .add(this.terrainMaterial.uniforms.uContourWidth, "value")
        .min(0)
        .max(3)
        .step(0.001)
        .name("Contour Width");
      this.debugFolder
        .add(this.terrainMaterial.uniforms.uContourFrequency, "value")
        .min(0.1)
        .max(20)
        .step(0.1)
        .name("Contour Frequency");
      this.debugFolder
        .add(this.terrainMaterial.uniforms.uColorNumber, "value")
        .min(1)
        .max(3)
        .step(1)
        .name("Color Number");
      this.debugFolder
        .addColor(this.options, "uColorOne")
        .name("Color One")
        .onChange(() => {
          this.terrainMaterial.uniforms.uColorOne.value.set(
            this.options.uColorOne
          );
        });
      this.debugFolder
        .addColor(this.options, "uColorTwo")
        .name("Color Two")
        .onChange(() => {
          this.terrainMaterial.uniforms.uColorTwo.value.set(
            this.options.uColorTwo
          );
        });
      this.debugFolder
        .addColor(this.options, "uColorThree")
        .name("Color Two")
        .onChange(() => {
          this.terrainMaterial.uniforms.uColorThree.value.set(
            this.options.uColorThree
          );
        });
      this.debugFolder
        .addColor(this.options, "uLineColor")
        .name("Line Color")
        .onChange(() => {
          this.terrainMaterial.uniforms.uLineColor.value.set(
            this.options.uLineColor
          );
        });

      this.debugCircleFolder = this.debugFolder.addFolder("Circle");
      this.debugCircleFolder
        .add(this.terrainMaterial.uniforms.uCirclePos.value, "x")
        .min(-1)
        .max(1)
        .step(0.001)
        .name("Position X");
      this.debugCircleFolder
        .add(this.terrainMaterial.uniforms.uCirclePos.value, "y")
        .min(-1)
        .max(1)
        .step(0.0001)
        .name("Position Y");
      this.debugCircleFolder
        .add(this.terrainMaterial.uniforms.uCircleRadius, "value")
        .min(0.0001)
        .max(0.001)
        .step(0.00001)
        .name("Circle Radius");
      this.debugCircleFolder
        .add(this.terrainMaterial.uniforms.uNoiseIntensity, "value")
        .min(10)
        .max(200)
        .step(0.01)
        .name("Intensity");
    }
  }

  update() {
    this.terrainMaterial.uniforms.uTime.value = this.time.elapsedTime * 0.035;
  }
}
