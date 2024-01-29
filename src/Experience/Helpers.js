import * as THREE from "three";

import colors from "nice-color-palettes";

import Experience from "./Experience.js";

import { TransformControls } from "three/addons/controls/TransformControls.js";
import toonMaterial from "./Materials/ToonMaterial.js";

export default class Helpers {
  constructor() {
    this.experience = new Experience();

    this.debug = this.experience.debug;
    this.inputEvents = this.experience.inputEvents;
    this.camera = this.experience.camera;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;
    this.manager = this.experience.manager;

    // Setup
    this.DirectionalLightHelper = null;

    this.transformControls = new TransformControls(
      this.camera.instance,
      this.canvas
    );
    this.transformControls.enabled = false;
    this.scene.add(this.transformControls);

    // Keyboard Events
    this.inputEvents.on("keydown", (keyCode) => {
      this.onKeyDown(keyCode);
    });

    // Debug
    this.setDebug();
    // this.addAxesHelper();
  }

  onKeyDown(keyCode) {
    switch (keyCode) {
      case "KeyG":
        this.transformControls.setMode("translate");
        break;

      case "KeyR":
        this.transformControls.setMode("rotate");
        break;

      case "KeyS":
        this.transformControls.setMode("scale");
        break;
    }
  }

  addTargetHelper() {
    // Create a new target helper
    this.helper = this.createTargetHelper();

    // Set the helper's position in front of the camera
    const distance = 7;
    const position = this.camera.cameraParent.position
      .clone()
      .add(
        this.camera.instance
          .getWorldDirection(new THREE.Vector3())
          .multiplyScalar(distance)
      );
    this.helper.position.copy(position);

    // Add the helper to the scene and TransformControls
    this.scene.add(this.helper);
    this.transformControls.attach(this.helper);
  }

  createTargetHelper() {
    const geometry = new THREE.OctahedronGeometry(1, 0);

    const material = new THREE.MeshNormalMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(0.075, 0.1, 0.075);
    return mesh;
  }

  addAxesHelper() {
    this.axesHelper = new THREE.AxesHelper(400);
    this.axesHelper.position.y = 5;
    this.scene.add(this.axesHelper);
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Helpers");
      this.debugFolder.close();

      this.transformControls.enabled = false;

      this.debugFolder
        .add(
          {
            button: () => {
              if (!this.helper) {
                this.transformControls.enabled = true;
                this.addTargetHelper();
              } else {
                this.transformControls.enabled = false;
                this.transformControls.detach();
                this.scene.remove(this.helper);
                this.helper = null;
              }
            },
          },
          "button"
        )
        .name("Toggle Helper");
      this.debugFolder
        .add(
          {
            button: () => {
              if (this.helper) {
                this.camera.instance.lookAt(this.helper.position);
                console.log(
                  "Helper Position:",
                  `new THREE.Vector3(${this.helper.position.x.toFixed(
                    2
                  )},${this.helper.position.y.toFixed(
                    2
                  )},${this.helper.position.z.toFixed(2)})`
                );
              }
            },
          },
          "button"
        )
        .name("Look At Helper");
      this.debugFolder
        .add(
          {
            button: () => {
              const sunLight = this.experience.world.environment.sunLight;
              this.DirectionalLightHelper = new THREE.DirectionalLightHelper(
                sunLight,
                5
              );
              this.scene.add(this.DirectionalLightHelper);
            },
          },
          "button"
        )
        .name("Show Light Helper");
      this.debugFolder
        .add(
          {
            button: () => {
              const palette = colors[Math.floor(Math.random() * 100)];
              this.manager.trigger("updateColors", palette);
            },
          },
          "button"
        )
        .name("Random Colors");
    }
  }

  update() {}
}
