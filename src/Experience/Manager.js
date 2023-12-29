import * as THREE from "three";
import Experience from "./Experience.js";
import EventEmitter from "./Utils/EventEmitter.js";

export default class Manager extends EventEmitter {
  constructor() {
    super();
    this.experience = new Experience();

    this.debug = this.experience.debug;
    this.renderer = this.experience.renderer;
    this.camera = this.experience.camera;

    // Debug
    this.setDebug();
  }

  addClickEventToMesh(mesh, clickHandlerFunction) {
    if (!this.interactionManager) {
      this.interactionManager = this.experience.renderer.interactionManager;
    }

    mesh.addEventListener("mouseover", (event) => {
      document.body.style.cursor = "pointer";
    });

    mesh.addEventListener("mouseout", (event) => {
      document.body.style.cursor = "default";
    });

    mesh.addEventListener("click", (event) => {
      if (typeof clickHandlerFunction === "function") {
        clickHandlerFunction(event);
      }
    });
    this.interactionManager.add(mesh);
  }

  setDebug() {
    if (this.debug.active) {
      // this.debugFolder = this.debug.ui.addFolder("View Manager");
      // this.debugFolder.close();
    }
  }

  update() {}
}
