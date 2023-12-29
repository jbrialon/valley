import * as THREE from "three";

import Experience from "../Experience";
import Environment from "./Environment";
import Loader from "./Loader";
import Map from "./Map";
import Markers from "./Markers";
import Paths from "./Paths";
import Overlay from "./Overlay";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.resources = this.experience.resources;

    // Wait for resources to be loaded
    this.resources.on("ready", () => {
      // this.loaderOverlay = new Loader();

      // Setup
      this.day1 = new Overlay({
        name: "day1",
        uAlpha: 1,
        uStrength: 0.5,
        uLineColor: "#53524c", // #74675e
        uColorOne: "#f4814a", // #6a5e52
        uColorTwo: "#eda17f",
        uColorThree: "#e45221",
        uColorNumber: 2,
        uContourFrequency: 2.7,
        uMaskTexture: "dayOneTexture",
        uCirclePos: new THREE.Vector2(0.14, 0.41),
        offsetPosY: 0.001,
      });

      this.day2 = new Overlay({
        name: "day2",
        uAlpha: 1,
        uStrength: 0.5,
        uLineColor: "#53524c", // #74675e
        uColorOne: "#f4814a", // #6a5e52
        uColorTwo: "#eda17f",
        uColorThree: "#e45221",
        uColorNumber: 2,
        uContourFrequency: 2.7,
        uMaskTexture: "dayTwoTexture",
        uCirclePos: new THREE.Vector2(0.02, 0.356),
        offsetPosY: 0.002,
      });

      this.day3 = new Overlay({
        name: "day3",
        uAlpha: 1,
        uStrength: 0.5,
        uLineColor: "#53524c", // #74675e
        uColorOne: "#f4814a", // #6a5e52
        uColorTwo: "#eda17f",
        uColorThree: "#e45221",
        uColorNumber: 2,
        uContourFrequency: 2.7,
        uMaskTexture: "dayFourTexture",
        uCirclePos: new THREE.Vector2(-0.705, 0.696),
        offsetPosY: 0.003,
      });

      this.map = new Map();
      this.markers = new Markers();
      this.paths = new Paths();
      this.environment = new Environment();

      this.camera.setPaths();
      // Show Experience
      // this.loaderOverlay.hideLoader();
    });
  }

  update() {
    if (this.map) this.map.update();
    if (this.day1) this.day1.update();
    if (this.day2) this.day2.update();
    if (this.day3) this.day3.update();
    if (this.markers) this.markers.update();
  }
}
