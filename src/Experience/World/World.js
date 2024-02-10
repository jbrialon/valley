import Experience from "../Experience";
import Environment from "./Environment";
import Loader from "./Loader";
import Map from "./Map";
import Markers from "./Markers";
import Paths from "./Paths";
import Overlay from "./Overlay";
import DashLine from "./DashLine";
import Props from "./Props";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.resources = this.experience.resources;

    // Wait for resources to be loaded
    this.loader = new Loader();
    this.resources.on("ready", () => {
      // Setup
      this.map = new Map();
      this.overlay = new Overlay();
      this.markers = new Markers();
      this.props = new Props();
      this.paths = new Paths();
      this.environment = new Environment();

      this.dashLine = new DashLine();
      this.camera.setPaths();
    });
  }

  resize() {
    if (this.loader) this.loader.resize();
    if (this.dashLine) this.dashLine.resize();
  }

  update() {
    if (this.loader) this.loader.update();
    if (this.map) this.map.update();
    if (this.overlay) this.overlay.update();
    if (this.markers) this.markers.update();
    if (this.props) this.props.update();
    if (this.paths) this.paths.update();
    if (this.environment) this.environment.update();
    if (this.dashLine) this.dashLine.update();
  }
}
