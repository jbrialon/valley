import * as THREE from "three";

import Experience from "./Experience.js";

import { TransformControls } from "three/addons/controls/TransformControls.js";
import outlineMaterial from "./Materials/OutlineMaterials";

export default class Helpers {
  constructor() {
    this.experience = new Experience();

    this.debug = this.experience.debug;
    this.inputEvents = this.experience.inputEvents;
    this.camera = this.experience.camera.instance;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    // Setup
    this.transformControls = new TransformControls(this.camera, this.canvas);
    this.transformControls.enabled = true;
    this.scene.add(this.transformControls);

    // Keyboard Events
    this.inputEvents.on("keydown", (keyCode) => {
      this.onKeyDown(keyCode);
    });

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Helpers");
      // this.debugFolder.close();
    }
    this.setDebug();
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

  addHelper() {
    // Create a new helper
    this.helper = this.createTargetHelper();
    this.helper.scale.set(0.5, 0.5, 0.5);

    // Set the helper's position in front of the camera
    const distance = 7; // Adjust the distance as needed
    const position = this.camera.position
      .clone()
      .add(
        this.camera
          .getWorldDirection(new THREE.Vector3())
          .multiplyScalar(distance)
      );
    this.helper.position.copy(position);

    // Add the helper to the scene and TransformControls
    this.scene.add(this.helper);
    this.transformControls.attach(this.helper);
  }

  createTargetHelper() {
    const geometry = new THREE.CapsuleGeometry(1, 1, 4, 8);
    // const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const material = outlineMaterial({
      uLinewidth: 0.3,
      uColor: 0xff00ff,
    });

    return new THREE.Mesh(geometry, material);
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder
        .add(
          {
            button: () => {
              if (!this.helper) {
                this.addHelper();
              } else {
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
                this.camera.lookAt(this.helper.position);
                console.log(this.helper.position);
              }
            },
          },
          "button"
        )
        .name("Look At Helper");
    }
  }

  update() {
    //if (this.transformControls) this.transformControls.update();
  }
}
