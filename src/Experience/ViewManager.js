import * as THREE from "three";
import Experience from "./Experience";
import EventEmitter from "./Utils/EventEmitter";

import camera from "./Data/camera.js";

export default class ViewManager extends EventEmitter {
  constructor() {
    super();
    this.experience = new Experience();

    this.debug = this.experience.debug;
    this.camera = this.experience.camera;

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("View Manager");
      // this.debugFolder.close();
    }

    // Debug
    this.setDebug();
  }

  setDebug() {
    if (this.debug.active) {
      Object.entries(camera).forEach(([key, value]) => {
        this.debugFolder
          .add(
            {
              button: () => {
                this.trigger("cameraPositionChanged", key);
                this.experience.camera.animateCameraPosition(key);
              },
            },
            "button"
          )
          .name(key);
      });
    }
  }

  update() {}
}
