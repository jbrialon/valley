import Experience from "../Experience";
import Environment from "./Environment";
import Loader from "./Loader";
import Map from "./Map";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Wait for resources to be loaded
    this.resources.on("ready", () => {
      this.loaderOverlay = new Loader();
      // Setup
      this.mapOverlayOne = new Map({
        name: "Map Overlay",
        uAlpha: 0,
        uLineColor: "#53524c", // #74675e
        uColorOne: "#f4814a", // #6a5e52
        uColorTwo: "#eda17f",
        uColorThree: "#e45221",
        uColorNumber: 3,
        uContourFrequency: 3.3,
        uMaskTexture: "maskTexture",
        offsetPosY: 0.001,
        addButton: false,
      });

      this.map = new Map({
        name: "Map",
        uAlpha: 1,
        uLineColor: "#f4e2d6", // #74675e
        uColorOne: "#bca48f", // #6a5e52
        uColorTwo: "#eda17f",
        uColorThree: "#e45221",
        uColorNumber: 1,
        uContourFrequency: 3.3,
        uMaskTexture: "noMaskTexture",
        offsetPosY: 0,
        addButton: true,
      });
      this.environment = new Environment();

      // Show Experience
      this.loaderOverlay.hideLoader();
    });
  }

  update() {
    if (this.map) this.map.update();
  }
}
