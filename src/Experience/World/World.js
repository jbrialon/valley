import Experience from "../Experience";
import Environment from "./Environment";
import Loader from "./Loader";
import Map from "./Map";
import Overlay from "./Overlay";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Wait for resources to be loaded
    this.resources.on("ready", () => {
      // this.loaderOverlay = new Loader();
      // Setup
      this.day1 = new Overlay({
        name: "day1",
        uAlpha: 0,
        uStrength: 0.5,
        uLineColor: "#53524c", // #74675e
        uColorOne: "#f4814a", // #6a5e52
        uColorTwo: "#eda17f",
        uColorThree: "#e45221",
        uColorNumber: 3,
        uContourFrequency: 3.3,
        uMaskTexture: "dayOneTexture",
        offsetPosY: 0.001,
      });

      this.day2 = new Overlay({
        name: "day2",
        uAlpha: 0,
        uStrength: 0.5,
        uLineColor: "#53524c", // #74675e
        uColorOne: "#f4814a", // #6a5e52
        uColorTwo: "#eda17f",
        uColorThree: "#e45221",
        uColorNumber: 3,
        uContourFrequency: 3.3,
        uMaskTexture: "dayTwoTexture",
        offsetPosY: 0.002,
      });

      this.day3 = new Overlay({
        name: "day3",
        uAlpha: 0,
        uStrength: 0.5,
        uLineColor: "#53524c", // #74675e
        uColorOne: "#f4814a", // #6a5e52
        uColorTwo: "#eda17f",
        uColorThree: "#e45221",
        uColorNumber: 3,
        uContourFrequency: 3.3,
        uMaskTexture: "dayThreeTexture",
        offsetPosY: 0.003,
      });

      this.day4 = new Overlay({
        name: "day4",
        uAlpha: 0,
        uStrength: 0.5,
        uLineColor: "#53524c", // #74675e
        uColorOne: "#f4814a", // #6a5e52
        uColorTwo: "#eda17f",
        uColorThree: "#e45221",
        uColorNumber: 3,
        uContourFrequency: 3.3,
        uMaskTexture: "dayFourTexture",
        offsetPosY: 0.004,
      });

      this.map = new Map();
      this.environment = new Environment();

      // Show Experience
      // this.loaderOverlay.hideLoader();
    });
  }

  update() {
    if (this.map) this.map.update();
    if (this.mapOverlayOne) this.mapOverlayOne.update();
    if (this.mapOverlayTwo) this.mapOverlayOne.update();
  }
}
