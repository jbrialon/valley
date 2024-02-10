import EventEmitter from "./EventEmitter";

export default class Sizes extends EventEmitter {
  constructor() {
    super();

    // Setup
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);

    this.adjustViewportHeight();

    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.pixelRatio = Math.min(window.devicePixelRatio, 2);

      this.adjustViewportHeight();

      this.trigger("resize");
    });
  }

  adjustViewportHeight() {
    const viewportHeight = this.height;
    // Set the value in a custom property to be used in CSS
    document.documentElement.style.setProperty("--vh", `${viewportHeight}px`);
  }
}
