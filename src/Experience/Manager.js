import Experience from "./Experience.js";
import EventEmitter from "./Utils/EventEmitter.js";

import {
  findMarkerChapter,
  findMarkerByName,
  findMaxConsecutive,
} from "./Utils/Utils.js";

import { markers } from "./Data/markers.js";

export default class Manager extends EventEmitter {
  constructor() {
    super();
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.renderer = this.experience.renderer;
    this.camera = this.experience.camera;

    // App State
    this.isScrollEnabled = false;
    this.isSearchEnabled = false;
    this.maxScrollProgress = 0.034;
    this.mouseMoveEnabled = false;
    this.tutorialStep = 0;

    this.revealedSteps = {
      chapterOne: [],
      chapterTwo: [],
      chapterTree: [],
      bonus: [],
    };

    // Setup
    this.interactiveMeshes = [];
    this.chapters = ["chapterOne", "chapterTwo", "chapterTree"];
    this.currentChapter = 0;

    // Debug
    this.setDebug();
  }

  startGame() {
    this.trigger("loader-intro-hide", () => {
      this.setScrollState(true);
      this.setSearchState(true);
      this.setMouseMoveState(true);
      this.setMaxScrollProgress(1);
      this.tutorialStep = 4;
      this.trigger("ui-chapter-show", "Chapter 1", "Langtang Valley");
    });
  }

  // Tutorial State Management
  goToTutorialStep(step) {
    // we can only go to a further step
    if (step > this.tutorialStep) {
      switch (step) {
        case 1:
          this.tutorialStep = 1;
          this.setSearchState(true);
          this.trigger(
            "ui-tooltip-show",
            "Navigate your mouse to the zone and hold click to expose it."
          );
          this.trigger("loader-tutorial-one");
          break;

        case 2:
          this.tutorialStep = 2;
          this.setSearchState(false);
          this.trigger("loader-tutorial-hide", () => {
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
          this.trigger("loader-tutorial-hide");
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

  // State Management Search/Browse
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

  // State Management Mouse Movement
  isMouseMoveEnabled() {
    return this.mouseMoveEnabled;
  }
  setMouseMoveState(state) {
    this.mouseMoveEnabled = state;
  }

  // Revealed Steps Managements
  addToRevealedSteps(name) {
    const chapter = findMarkerChapter(markers, name);
    console.log(chapter);
    const currentChapter = this.chapters[this.currentChapter];

    if (chapter) {
      const marker = findMarkerByName(markers, name);
      if (!this.revealedSteps[chapter].includes(marker.order)) {
        this.revealedSteps[chapter].push(marker.order);
        if (
          chapter === currentChapter &&
          this.revealedSteps[currentChapter].length > 1
        ) {
          const previousSteps = markers[currentChapter].filter(
            (item) => item.order < marker.order
          );
          const allPreviousStepsRevealed = previousSteps.every((item) =>
            this.revealedSteps[currentChapter].includes(item.order)
          );

          if (allPreviousStepsRevealed) {
            const currentStep =
              findMaxConsecutive(this.revealedSteps[chapter]) - 1;

            this.trigger("showDashLine", currentStep, name);
            console.log(
              `All previous steps for ${name} are revealed. Showing path to ${currentStep}.`
            );
          } else {
            const text = "I must have missed a step along the way...";
            this.trigger("ui-tooltip-auto-hide", text);
            // console.log(`All previous steps for ${name} are not revealed.`);
          }
          // if (
          //   this.revealedSteps[currentChapter].length ===
          //   markers[currentChapter].length
          // ) {
          //   // we should wait for all animations to be hover actually
          //   // this.goToNextChapter();
          // }
        } else if (
          this.revealedSteps[currentChapter].length === 1 &&
          marker.order === 1 &&
          currentChapter === "chapterOne"
        ) {
          // tutorial mode, we hide the loader if we reveal the first step
          this.goToTutorialStep(2);
        }
        // Tutorial mode
        if (marker.order === 2 && currentChapter === "chapterOne") {
          this.goToTutorialStep(4);
        }
      } else if (chapter !== currentChapter && chapter !== "bonus") {
        const text = "I can't go there yet, but I can come back later.";
        this.trigger("ui-tooltip-auto-hide", text);
        // console.log(`Marker not found, probably not in the current chapter.`);
      } else if (chapter === "bonus") {
        const text = `Achievement! your found ${marker.displayName}!`;
        this.trigger("ui-tooltip-auto-hide", text);
      }
    }
  }

  // Chapter Manegement
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
