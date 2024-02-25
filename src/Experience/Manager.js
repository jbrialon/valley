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
    this.inputEvents = this.experience.inputEvents;

    // App State
    this.isScrollEnabled = false;
    this.isSearchEnabled = false;
    this.maxScrollProgress = 0.034;
    this.mouseMoveEnabled = true;
    this.isZoomed = false;
    this.activeMarker = null;
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
    this.tutorialStep = 4;
    // this.inputEvents.requestPermission();
    this.trigger("ui-title-hide", () => {
      this.trigger("ui-chapter-show", this.currentChapter);
      this.trigger("log-show");
    });
    this.setScrollState(true);
    this.setSearchState(true);
    this.setMouseMoveState(true);
    this.setMaxScrollProgress(1);
  }

  // on Marker Hover -> Show Info Window
  showInfowindow(markerMesh) {
    if (!this.getZoomState() && this.getTutorialStep() === 4) {
      this.trigger("infowindow-show", markerMesh.index);
      this.setActiveMarker(markerMesh);
    }
  }

  // on Marker Click -> Zoom Out of Marker
  zoomOutOfMarker() {
    if (this.getZoomState()) {
      this.trigger("camera-unzoom");
      this.trigger("ui-step-hide");
      this.setActiveMarker(null);
    }
  }

  // Tutorial State Management
  goToTutorialStep(step) {
    // we can only go to a further step
    if (step > this.tutorialStep) {
      switch (step) {
        case 1:
          this.tutorialStep = 1;
          this.trigger("loader-tutorial-one");
          this.setSearchState(true);
          this.setMouseMoveState(false);
          this.trigger("ui-tooltip-show", "tooltip.tutorial.two");
          this.trigger("loader-tutorial-two");
          break;
        case 2:
          this.tutorialStep = 2;
          this.setSearchState(false);
          this.trigger("loader-tutorial-hide", () => {
            this.setScrollState(true);
            this.setMouseMoveState(true);
          });

          this.trigger("ui-tooltip-hide", () => {
            this.trigger("ui-tooltip-show", "tooltip.tutorial.three");
          });
          break;

        case 3:
          this.tutorialStep = 3;
          this.setScrollState(false);
          this.setMouseMoveState(false);
          this.setSearchState(true);
          this.trigger("ui-tooltip-hide", () => {
            this.trigger("ui-tooltip-show", "tooltip.tutorial.four");
          });
          this.trigger("loader-tutorial-four");
          break;

        case 4:
          this.tutorialStep = 4;
          this.trigger("loader-tutorial-hide");
          this.trigger("ui-title-hide");
          this.trigger("ui-tooltip-hide", () => {
            this.trigger("ui-tooltip-auto-hide", "tooltip.tutorial.five");
            this.setScrollState(true);
            this.setMouseMoveState(true);
            this.setMaxScrollProgress(1);
            this.trigger("ui-chapter-show", this.currentChapter);
            this.trigger("log-show");
          });

        default:
          console.warn(`No action defined for step ${step}`);
      }
    }
  }

  getTutorialStep() {
    return this.tutorialStep;
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

  // State Management Zoomed app
  getZoomState() {
    return this.isZoomed;
  }
  setZoomState(state) {
    this.isZoomed = state;
  }
  // State Management Active  marker
  getActiveMarker() {
    return this.activeMarker;
  }
  setActiveMarker(marker) {
    this.activeMarker = marker;
  }

  getRevealedStepsPerChapter() {
    const currentChapter = this.getCurrentChapter();
    return this.revealedSteps[currentChapter];
  }

  getRevealedBonuses() {
    return this.revealedSteps["bonus"];
  }

  // Revealed Steps Managements
  addToRevealedSteps(name) {
    const chapter = findMarkerChapter(markers, name);
    const currentChapter = this.chapters[this.currentChapter];

    if (chapter) {
      const marker = findMarkerByName(markers, name);
      if (!this.revealedSteps[chapter].includes(marker.order)) {
        this.revealedSteps[chapter].push(marker.order);
        if (
          chapter === currentChapter &&
          this.revealedSteps["chapterOne"].length > 1
        ) {
          const previousSteps = markers[currentChapter].filter(
            (item) => item.order < marker.order
          );
          const allPreviousStepsRevealed = previousSteps.every((item) =>
            this.revealedSteps[currentChapter].includes(item.order)
          );

          if (allPreviousStepsRevealed) {
            // All previous steps are revealed. Showing path to currentStep.
            const currentStep =
              findMaxConsecutive(this.revealedSteps[chapter]) - 1;

            this.trigger("showDashLine", currentStep, name);
          } else {
            // All previous steps for are not revealed.
            this.trigger("ui-tooltip-auto-hide", "tooltip.message.missed");
          }
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
        this.trigger("ui-tooltip-auto-hide", "tooltip.message.later");
      } else if (chapter === "bonus") {
        this.trigger("ui-tooltip-auto-hide", "tooltip.message.achievement", [
          marker.displayName,
        ]);
      }
    }
  }

  isLastStepOfChapter() {
    const currentChapter = this.chapters[this.currentChapter];

    return (
      this.revealedSteps[currentChapter].length ===
      markers[currentChapter].length
    );
  }

  // Chapter Manegement
  getCurrentChapterIndex() {
    return this.currentChapter;
  }

  getCurrentChapter() {
    return this.chapters[this.currentChapter];
  }
  goToNextChapter() {
    // All steps from this.currentChapter are revealed, go to next chapter.
    if (this.currentChapter < this.chapters.length) {
      this.currentChapter++;
      this.trigger("ui-chapter-show", this.currentChapter);
      this.trigger("log-update-total");
      console.log(`Going to Chapter ${this.currentChapter + 1}`);
    }
  }

  // Interactions
  addClickEventToMesh(mesh, clickHandlerFunction) {
    if (!this.interactionManager) {
      this.interactionManager = this.experience.renderer.interactionManager;
    }

    mesh.addEventListener("mouseover", (event) => {
      document.body.style.cursor = "pointer";
    });

    mesh.addEventListener("mouseout", (event) => {
      document.body.style.cursor = "grab";
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
