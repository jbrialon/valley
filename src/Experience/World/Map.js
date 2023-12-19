import * as THREE from "three";
import { gsap } from "gsap";
import Experience from "../Experience";

import terrainMaterial from "../Materials/TerrainMaterial";
import outlineMaterial from "../Materials/OutlineMaterials";

export default class Map {
  constructor() {
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.manager = this.experience.Manager;
    this.resources = this.experience.resources;

    // Options
    this.options = {
      uAlpha: 1,
      uStrength: 0.5,
      uLineColor: "#f4e2d6", // #74675e
      uColorOne: "#bca48f", // #6a5e52
      uColorTwo: "#eda17f",
      uColorThree: "#e45221",
      uColorNumber: 1,
      uContourFrequency: 3.3,
    };
    // this.options = {
    //   uLineColor: "#53524c", // #74675e
    //   uColorOne: "#f4814a", // #6a5e52
    //   uColorTwo: "#eda17f",
    //   uColorThree: "#e45221",
    //   uColorNumber: 3,
    // };

    this.manager.on("cameraPositionChanged", (key) => {
      gsap.fromTo(
        this.terrainMaterial.uniforms.uContourFrequency,
        {
          value: 1,
        },
        {
          duration: 3,
          value: 3.3,
          ease: "power4.inOut",
        }
      );
    });

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Map");
      this.debugFolder.close();
    }

    // Setup
    this.resource = this.resources.items.mapModel;
    this.terrainMaterial = terrainMaterial({
      uAlpha: 1,
      uContourWidth: 1,
      uColorNumber: this.options.uColorNumber,
      uContourFrequency: this.options.uContourFrequency,
      uTerrainColor: this.options.uTerrainColor,
      uLineColor: this.options.uLineColor,
      uColorOne: this.options.uColorOne,
      uColorTwo: this.options.uColorTwo,
      uColorThree: this.options.uColorThree,
      uMaskTexture: null,
    });

    this.markerMaterial = outlineMaterial({
      uLinewidth: 0.3,
      uColor: 0x992625,
    });
    this.lakeMaterial = new THREE.MeshBasicMaterial({ color: 0x6bae8d });
    this.setModel();

    // Debug
    this.setDebug();
  }

  setModel() {
    this.model = this.resource.scene.clone();

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name === "map") {
        child.material = this.terrainMaterial;
      } else if (child instanceof THREE.Mesh && child.name.includes("Lake")) {
        child.material = this.lakeMaterial;
      } else if (child instanceof THREE.Mesh && child.name !== "Scene") {
        child.material = this.markerMaterial;
      } else if (child instanceof THREE.PerspectiveCamera) {
      }
    });

    this.scene.add(this.model);
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder
        .add(this.terrainMaterial.uniforms.uAlpha, "value")
        .min(0)
        .max(1)
        .step(0.01)
        .name("Alpha");
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
      // this.debugFolder
      //   .add(this.terrainMaterial.uniforms.uColorNumber, "value")
      //   .min(1)
      //   .max(3)
      //   .step(1)
      //   .name("Color Number");
      this.debugFolder
        .addColor(this.options, "uColorOne")
        .name("Color One")
        .onChange(() => {
          this.terrainMaterial.uniforms.uColorOne.value.set(
            this.options.uColorOne
          );
        });
      // this.debugFolder
      //   .addColor(this.options, "uColorTwo")
      //   .name("Color Two")
      //   .onChange(() => {
      //     this.terrainMaterial.uniforms.uColorTwo.value.set(
      //       this.options.uColorTwo
      //     );
      //   });
      // this.debugFolder
      //   .addColor(this.options, "uColorThree")
      //   .name("Color Two")
      //   .onChange(() => {
      //     this.terrainMaterial.uniforms.uColorThree.value.set(
      //       this.options.uColorThree
      //     );
      //   });
      this.debugFolder
        .addColor(this.options, "uLineColor")
        .name("Line Color")
        .onChange(() => {
          this.terrainMaterial.uniforms.uLineColor.value.set(
            this.options.uLineColor
          );
        });
    }
  }

  update() {}
}
