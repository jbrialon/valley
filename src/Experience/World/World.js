import Experience from "../Experience";
import Environment from "./Environment";
import Map from "./Map";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Wait for resources to be loaded
    this.resources.on("ready", () => {
      // Setup
      this.map = new Map();
      this.environment = new Environment();
    });
  }

  update() {
    if (this.map) this.map.update();
  }
}
