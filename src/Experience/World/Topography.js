import Experience from "../Experience";
import { TerrainMap, Marker } from "../../TerrainMap/index.js";

export default class Topography {
  constructor() {
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.camera = this.experience.camera;
    this.renderer = this.experience.renderer;

    // Options
    this.options = {
      center: [85.3459, 28.1606], // Syabru Besi
    };

    // Setup
    this.setTerrainMap();

    // Debug
    this.setDebug();
  }

  setTerrainMap() {
    this.terrainMap = new TerrainMap({
      accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
      center: this.options.center,
      satelliteZoomOffset: 2,
    });
    this.ready = this.terrainMap.ready;

    this.scene.add(this.terrainMap);

    this.marker = new Marker({ color: 0xcb6c6a })
      .setLngLat(this.options.center)
      .addTo(this.terrainMap);
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder({
        title: "Topography",
        expanded: false,
      });

      this.debugFolder.addBinding(this.terrainMap.exaggeration, "value", {
        label: "Exaggeration",
        min: 0,
        max: 5,
        step: 0.05,
      });
    }
  }

  update() {
    this.terrainMap.update(this.camera.instance);
  }

  destroy() {
    this.scene.remove(this.terrainMap);
    this.terrainMap.dispose();
    this.debugFolder?.dispose();
  }
}
