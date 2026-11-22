import Experience from "./../Experience";
import EventEmitter from "./EventEmitter";

export default class Sizes extends EventEmitter {
  constructor() {
    super();
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.targetElement = this.experience.targetElement;

    // Resize event
    this.resize = this.resize.bind(this);
    window.addEventListener("resize", this.resize);

    this.adjustViewportHeight();
    this.resize();
  }
  /**
   * Resize
   */
  resize() {
    this.adjustViewportHeight();
    const containerBounds = this.targetElement.getBoundingClientRect();

    this.width = Math.floor(containerBounds.width);
    this.height = Math.floor(containerBounds.height);

    this.pixelRatio = Math.min(window.devicePixelRatio, 2);

    this.trigger("resize");
  }

  adjustViewportHeight() {
    const viewportHeight = window.innerHeight;
    // Set the value in a custom property to be used in CSS
    document.documentElement.style.setProperty("--vh", `${viewportHeight}px`);
  }
}
