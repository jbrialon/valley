import * as THREE from "three";
import { gsap } from "gsap";
import Experience from "../Experience";

import overlayMaterial from "../Materials/OverlayMaterial";

import markers from "../Data/markers.js";

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
    this.options = {
      uAlpha: 0,
      uStrength: 0.5,
      uLineColor: "#53524c", // #74675e
      uColorOne: "#f4814a", // #6a5e52
      uColorTwo: "#eda17f",
      uColorThree: "#e45221",
      uColorNumber: 2,
      uContourWidth: 1,
      uContourFrequency: 2.7,
      uMaskTexture: "dayOneTexture",
      uCirclePos: new THREE.Vector2(0.14, 0.417),
      uCircleRadius: 3,
      offsetPosY: 0.001,
    };

    // Setup
    this.activeMarker = null;
    this.resource = this.resources.items.mapModel;
    this.maskTexture = this.options.uMaskTexture
      ? this.resources.items[this.options.uMaskTexture].clone()
      : "";

    this.terrainMaterial = overlayMaterial({
      uAlpha: this.options.uAlpha,
      uStrength: this.options.uStrength,
      uPixelRatio: this.sizes.pixelRatio,
      uContourWidth: this.options.uContourWidth,
      uColorNumber: this.options.uColorNumber,
      uContourFrequency: this.options.uContourFrequency,
      uLineColor: this.options.uLineColor,
      uColorOne: this.options.uColorOne,
      uColorTwo: this.options.uColorTwo,
      uColorThree: this.options.uColorThree,
      uCirclePos: this.options.uCirclePos,
      uMaskTexture: this.maskTexture,
      uCircleRadius: this.options.uCircleRadius,
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
      this.revealOverlay(name);
    });

    this.manager.on("onMarkerHover", (name) => {
      // console.log(name);
    });

    this.manager.on("onMarkerOut", (name) => {
      // console.log(name);
    });
  }

  revealOverlay(name) {
    const timeline = gsap.timeline();
    const marker = this.getMarkerByName(name);

    if (this.activeMarker) {
      timeline
        .add("hide")
        .to(
          this.terrainMaterial.uniforms.uCircleRadius,
          {
            duration: 0.5,
            value: 0,
            ease: "power4.inOut",
            onStart: () => {
              // not setting to the right value
              this.options.uCircleRadius = marker.overlayRadius;
            },
          },
          "hide"
        )
        .to(
          this.terrainMaterial.uniforms.uAlpha,
          {
            duration: 0.5,
            value: 0,
            ease: "power4.inOut",
          },
          "hide"
        );
    }

    timeline
      .add("reveal")
      .to(
        this.terrainMaterial.uniforms.uCircleRadius,
        {
          duration: 1.5,
          delay: !this.activeMarker ? 0.5 : 0,
          value: this.options.uCircleRadius,
          ease: "power4.inOut",
          onStart: () => {
            this.activeMarker = marker.name;
            this.options.uCirclePos = marker.overlayPosition;
            this.options.uCircleRadius = marker.overlayRadius;

            this.terrainMaterial.uniforms.uCirclePos.value.x =
              this.options.uCirclePos.x;
            this.terrainMaterial.uniforms.uCirclePos.value.y =
              this.options.uCirclePos.y;
          },
        },
        "reveal"
      )
      .to(
        this.terrainMaterial.uniforms.uAlpha,
        {
          delay: !this.activeMarker ? 0.5 : 0,
          duration: 1.5,
          value: 1,
          ease: "power4.inOut",
        },
        "reveal"
      );
  }

  getMarkerByName(name) {
    return markers.find((marker) => marker.name === name);
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.debugOverlayFolder.addFolder("Overlay");
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
        .step(0.0001)
        .name("Position X");
      this.debugCircleFolder
        .add(this.terrainMaterial.uniforms.uCirclePos.value, "y")
        .min(-1)
        .max(1)
        .step(0.0001)
        .name("Position Y");
      this.debugCircleFolder
        .add(this.terrainMaterial.uniforms.uCircleRadius, "value")
        .min(1)
        .max(20)
        .step(0.0001)
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
    this.terrainMaterial.uniforms.uTime.value = this.time.elapsedTime * 0.015;
  }
}
