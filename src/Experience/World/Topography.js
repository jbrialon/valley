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
      style: { matcap: this.resources.items.matcap },
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

      const styleFolder = this.debugFolder.addFolder({
        title: "Style",
        expanded: false,
      });
      this.terrainMap.style.setDebug(styleFolder);

      // Redoing the colors is slow, so it waits until the slider is let go
      styleFolder
        .addBinding(this.terrainMap, "reliefRadius", {
          label: "Relief radius (m)",
          min: 500,
          max: 6000,
          step: 100,
        })
        .on("change", (event) => {
          if (event.last) this.terrainMap.setReliefRadius(event.value);
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
