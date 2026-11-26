import Experience from "../Experience";
import { TILE_WORLD } from "../../TerrainMap/index.js";
import Loader from "./Loader";
import Markers from "./Markers";
import Sky from "./Sky";
import Topography from "./Topography";
import Tracks from "./Tracks";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.resources = this.experience.resources;

    this.loader = new Loader();

    // Resources may already be done by the time the renderer is ready
    if (this.resources.isReady) {
      this.setup();
    } else {
      this.resources.on("ready", () => this.setup());
    }
  }

  async setup() {
    this.topography = new Topography();
    this.setSky();
    this.tracks = new Tracks({ terrainMap: this.topography.terrainMap });
    this.markers = new Markers({
      terrainMap: this.topography.terrainMap,
      sky: this.sky,
    });
    await this.topography.ready;

    // Show Experience
    this.loader.hideLoader();
  }

  // The fog ends half a tile past the loaded tiles, so their edge fades into the sky
  setSky() {
    const fogEnd = (this.topography.terrainMap.radius + 0.5) * TILE_WORLD;
    this.sky = new Sky({ fogStart: fogEnd * 0.4, fogEnd });
  }

  update() {
    if (this.topography) this.topography.update();
    if (this.markers) this.markers.update();
  }
}
