import Experience from "./Experience.js";
import EventEmitter from "./Utils/EventEmitter.js";

export default class Manager extends EventEmitter {
  constructor() {
    super();
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.renderer = this.experience.renderer;
    this.camera = this.experience.camera;

    // App State
    this.isScrollEnabled = false;
    this.isSearchEnabled = true;
    this.maxScrollProgress = 0.034;
    this.mouseMoveEnabled = false;
    this.tutorialStep = 0;

    // Setup
    this.interactiveMeshes = [];
    this.chapters = ["chapterOne", "chapterTwo", "chapterTree"];
    this.currentChapter = 0;

    // Debug
    this.setDebug();
  }

  // Tutorial State Management
  goToTutorialStep(step) {
    // we can only go to a further step
    if (step > this.tutorialStep) {
      switch (step) {
        case 1:
          this.tutorialStep = 1;
          this.trigger(
            "ui-tooltip-show",
            "Navigate your mouse to the zone and click to expose it."
          );
          this.trigger("loader-tutorial-one");
          break;

        case 2:
          this.tutorialStep = 2;
          this.setSearchState(false);
          this.trigger("loader-hide", () => {
            this.setScrollState(true);
            this.setMouseMoveState(true);
            this.trigger("ui-chapter-show", "Chapter 1", "Langtang Valley");
          });

          this.trigger("ui-tooltip-hide", () => {
            const text = "Use your mouse scroll to travel along the valley.";
            this.trigger("ui-tooltip-show", text);
          });
          break;

        case 3:
          this.tutorialStep = 3;
          this.setScrollState(false);
          this.setMouseMoveState(false);
          this.setSearchState(true);
          this.trigger("ui-tooltip-hide", () => {
            const text =
              "Navigate your mouse to the zone and click to expose the next step of our journey.";
            this.trigger("ui-tooltip-show", text);
          });
          this.trigger("loader-tutorial-two");
          break;

        case 4:
          this.tutorialStep = 4;
          this.trigger("loader-hide");
          this.trigger("ui-tooltip-hide", () => {
            const text =
              "Good job! have fun discovering! track your progress with your travel log! (TODO)";
            this.trigger("ui-tooltip-auto-hide", text);
            this.setScrollState(true);
            this.setMouseMoveState(true);
            this.setMaxScrollProgress(1);
          });

        default:
          console.warn(`No action defined for step ${step}`);
      }
    }
  }

  isSearchingEnabled() {
    return this.isSearchEnabled;
  }

  setSearchState(state) {
    this.isSearchEnabled = state;
  }

  // State Manegement Scroll
  isScrollingEnabled() {
    return this.isScrollEnabled;
  }

  setScrollState(state) {
    this.isScrollEnabled = state;
  }

  // State Management Max Scroll Progress
  getMaxScrollProgress() {
    return this.maxScrollProgress;
  }

  setMaxScrollProgress(max) {
    this.maxScrollProgress = max;
  }

  // State Management mouse movement
  isMouseMoveEnabled() {
    return this.mouseMoveEnabled;
  }

  setMouseMoveState(state) {
    this.mouseMoveEnabled = state;
  }

  getCurrentChapter() {
    return this.chapters[this.currentChapter];
  }

  goToNextChapter() {
    console.log(
      `All steps from ${this.currentChapter} are revealed, go to next chapter.`
    );
    if (this.currentChapter < this.chapters.length) {
      this.currentChapter++;
      this.trigger(
        "ui-chapter-show",
        `Chapter ${this.currentChapter + 1}`,
        "Acclimatization"
      );
      console.log(`Going to Chapter ${this.currentChapter + 1}`);
    }
  }

  // Interactions
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
