import Experience from "../Experience";
import { Polyline } from "../../TerrainMap/index.js";
import tracks from "../../data/tracks.json";

export default class Tracks {
  constructor({ terrainMap }) {
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.terrainMap = terrainMap;

    this.items = [];

    // Setup
    this.setTracks();
    this.setDebug();
  }

  setTracks() {
    for (const { id, lngLats } of tracks) {
      const polyline = new Polyline()
        .setLngLats(lngLats)
        .addTo(this.terrainMap);
      polyline.mesh.name = id;
      this.items.push(polyline);
    }
  }

  // Applied to every track at once
  forEachTrack(apply) {
    for (const polyline of this.items) {
      apply(polyline);
    }
  }

  setDebug() {
    if (!this.debug.active || !this.items.length) return;
    this.debugFolder = this.debug.ui.addFolder({
      title: "Tracks",
      expanded: false,
    });
    const style = this.items[0];
    const settings = {
      color: `#${style.material.color.getHexString()}`,
      dashLength: style.uniforms.dashLength.value,
      gapLength: style.uniforms.gapLength.value,
      roundness: style.uniforms.roundness.value,
      lift: style.options.lift,
      width: style.options.width,
    };

    this.debugFolder
      .addBinding(settings, "color", { label: "Color" })
      .on("change", () =>
        this.forEachTrack((polyline) =>
          polyline.material.color.set(settings.color),
        ),
      );
    this.debugFolder
      .addBinding(settings, "dashLength", {
        label: "Dash",
        min: 0.05,
        max: 3,
        step: 0.01,
      })
      .on("change", () =>
        this.forEachTrack(
          (polyline) =>
            (polyline.uniforms.dashLength.value = settings.dashLength),
        ),
      );
    this.debugFolder
      .addBinding(settings, "gapLength", {
        label: "Gap",
        min: 0,
        max: 3,
        step: 0.01,
      })
      .on("change", () =>
        this.forEachTrack(
          (polyline) =>
            (polyline.uniforms.gapLength.value = settings.gapLength),
        ),
      );
    this.debugFolder
      .addBinding(settings, "roundness", {
        label: "Roundness",
        min: 0,
        max: 1,
        step: 0.01,
      })
      .on("change", () =>
        this.forEachTrack(
          (polyline) =>
            (polyline.uniforms.roundness.value = settings.roundness),
        ),
      );

    this.debugFolder
      .addBinding(settings, "lift", {
        label: "Lift",
        min: 0,
        max: 2,
        step: 0.01,
      })
      .on("change", () =>
        this.forEachTrack((polyline) => {
          polyline.options.lift = settings.lift;
          polyline.drape();
        }),
      );

    this.debugFolder
      .addBinding(settings, "width", {
        label: "Width",
        min: 0.02,
        max: 1,
        step: 0.01,
      })
      .on("change", (event) => {
        if (!event.last) return;
        this.forEachTrack((polyline) => {
          polyline.options.width = settings.width;
          polyline.build();
        });
      });
  }

  destroy() {
    for (const polyline of this.items) polyline.dispose();
    this.items = [];
    this.debugFolder?.dispose();
  }
}
