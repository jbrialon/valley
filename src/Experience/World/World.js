import Experience from "../Experience";
import Environment from "./Environment";
import Loader from "./Loader";
import Map from "./Map";
import Markers from "./Markers";
import Paths from "./Paths";
import Overlay from "./Overlay";
import DashLine from "./DashLine";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.resources = this.experience.resources;

    // Wait for resources to be loaded
    // this.loader = new Loader();

    this.resources.on("ready", () => {
      // Setup
      this.map = new Map();
      this.overlay = new Overlay();
      this.markers = new Markers();
      this.paths = new Paths();
      this.environment = new Environment();

      this.dashLine = new DashLine();
      this.camera.setPaths();

      // Show Experience
      // this.loader.hideLoader();
    });
  }

  resize() {
    if (this.dashLine) this.dashLine.resize();
  }

  update() {
    if (this.map) this.map.update();
    if (this.loader) this.loader.update();
    if (this.overlay) this.overlay.update();
    if (this.markers) this.markers.update();
    if (this.dashLine) this.dashLine.update();
  }
}
