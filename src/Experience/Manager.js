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
    this.interactiveMeshes = [];
    this.chapters = ["chapterOne", "chapterTwo", "chapterTree"];
    this.currentChapter = 0;

    // Debug
    this.setDebug();
  }

  getCurrentChapter() {
    return this.chapters[this.currentChapter];
  }

  goToNextChapter() {
    if (this.currentChapter < this.chapters.length) {
      this.currentChapter++;
      console.log(`Going to Chapter ${this.currentChapter + 1}`);
    }
  }

  addClickEventToMesh(mesh, clickHandlerFunction) {
    if (this.debug.active) {
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
      if (!this.interactiveMeshes.includes(mesh.name)) {
        this.interactiveMeshes.push(mesh.name);
        this.interactionManager.add(mesh);
      }
    }
  }

  addHoverEventToMesh(mesh, hoverHandlerFunction, outHandlerFunction) {
    if (!this.interactionManager) {
      this.interactionManager = this.experience.renderer.interactionManager;
    }

    mesh.addEventListener("mouseover", (event) => {
      if (typeof hoverHandlerFunction === "function") {
        hoverHandlerFunction(event);
      }
    });

    mesh.addEventListener("mouseout", (event) => {
      if (typeof outHandlerFunction === "function") {
        outHandlerFunction(event);
      }
    });

    // we add the mesh to the interaction Manager if it's not already there
    if (!this.interactiveMeshes.includes(mesh.name)) {
      this.interactiveMeshes.push(mesh.name);
      this.interactionManager.add(mesh);
    }
  }

  setDebug() {
    if (this.debug.active) {
      // this.debugFolder = this.debug.ui.addFolder("View Manager");
      // this.debugFolder.close();
    }
  }

  update() {}
}
