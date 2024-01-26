import Experience from "./Experience.js";
import EventEmitter from "./Utils/EventEmitter.js";

export default class Manager extends EventEmitter {
  constructor() {
    super();
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.renderer = this.experience.renderer;
    this.camera = this.experience.camera;

    // Setup
    this.meshes = [];
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

    // we add the mesh to the interaction Manager if it's not already there
    if (!this.meshes.includes(mesh.name)) {
      this.meshes.push(mesh.name);
      this.interactionManager.add(mesh);
    }
  }

  // addHoverEventToMesh(mesh, hoverHandlerFunction, outHandlerFunction) {
  //   if (!this.interactionManager) {
  //     this.interactionManager = this.experience.renderer.interactionManager;
  //   }

  //   mesh.addEventListener("mouseover", (event) => {
  //     if (typeof hoverHandlerFunction === "function") {
  //       hoverHandlerFunction(event);
  //     }
  //   });

  //   mesh.addEventListener("mouseout", (event) => {
  //     if (typeof outHandlerFunction === "function") {
  //       outHandlerFunction(event);
  //     }
  //   });

  //   // we add the mesh to the interaction Manager if it's not already there
  //   if (!this.meshes.includes(mesh.name)) {
  //     this.meshes.push(mesh.name);
  //     this.interactionManager.add(mesh);
  //   }
  // }

  setDebug() {
    if (this.debug.active) {
      // this.debugFolder = this.debug.ui.addFolder("View Manager");
      // this.debugFolder.close();
    }
  }

  update() {}
}
