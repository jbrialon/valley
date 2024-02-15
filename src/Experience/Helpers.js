import * as THREE from "three";
import colors from "nice-color-palettes";
import { TransformControls } from "three/addons/controls/TransformControls.js";

import Experience from "./Experience.js";

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
    this.initTransformControls();
    this.initEvents();

    // Debug
    this.setDebug();
  }

  initTransformControls() {
    if (this.debug.active) {
      this.transformControls = new TransformControls(
        this.camera.instance,
        this.canvas
      );
      this.transformControls.enabled = false;
      this.transformControls.size = 0.5;
      this.scene.add(this.transformControls);
    }
  }

  initEvents() {
    if (this.debug.active) {
      this.inputEvents.on("keydown", this.onKeyDown.bind(this));
    }
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

  setActiveMesh(mesh) {
    if (this.transformControls.enabled) {
      this.transformControls.attach(mesh);
    }
  }

  setDebug() {
    if (this.debug.active) {
      // this.debugFolder = this.debug.ui.addFolder("Helpers");
      this.debugFolder = this.debug.debugEditorFolder;
      this.debugFolder.close();

      let controlButton = this.debugFolder
        .add(
          {
            button: () => {
              this.transformControls.enabled = !this.transformControls.enabled;
              if (!this.transformControls.enabled) {
                this.transformControls.detach();
              }
              controlButton.name(
                this.transformControls.enabled
                  ? "Disable Controls"
                  : "Enable Controls"
              );
            },
          },
          "button"
        )
        .name("Enable Controls");
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
