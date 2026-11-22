import * as THREE from "three/webgpu";
import {
  Fn,
  cameraPosition,
  clamp,
  float,
  fog,
  max,
  mix,
  normalize,
  positionView,
  positionWorld,
  positionWorldDirection,
  rangeFogFactor,
  smoothstep,
  uniform,
} from "three/tsl";

import Experience from "../Experience";

const SETTINGS = {
  zenith: { label: "Zenith", view: "color" },
  horizon: { label: "Horizon", view: "color" },
  zenithHeight: { label: "Zenith height", min: 0.01, max: 1, step: 0.01 },
  haze: { label: "Haze", min: 0, max: 1, step: 0.01 },
  fogStart: { label: "Fog start", min: 0, max: 1000, step: 1 },
  fogEnd: { label: "Fog end", min: 0, max: 1000, step: 1 },
};

const isColor = (settings) => settings.view === "color";

export default class Sky {
  constructor() {
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;

    // Options
    this.options = {
      zenith: "#6f9cc4",
      horizon: "#c5d3dd",
      zenithHeight: 0.5,
      // How much blue tint the terrain gets before the fog, right at fogEnd
      haze: 0.075,
      fogStart: 100,
      fogEnd: 315,
    };

    // Setup
    this.setUniforms();
    this.setNodes();

    // Debug
    this.setDebug();
  }

  setUniforms() {
    this.uniforms = {};
    for (const [name, settings] of Object.entries(SETTINGS)) {
      const value = this.options[name];
      this.uniforms[name] = uniform(
        isColor(settings) ? new THREE.Color(value) : value,
      );
    }
  }

  setNodes() {
    const uniforms = this.uniforms;

    const skyColor = Fn(([direction]) => {
      const height = max(direction.y, 0);
      return mix(
        uniforms.horizon,
        uniforms.zenith,
        smoothstep(0, uniforms.zenithHeight, height),
      );
    });

    this.scene.backgroundNode = skyColor(positionWorldDirection);

    const distance = positionView.z.negate();
    const hazeFactor = clamp(distance.div(uniforms.fogEnd), 0, 1).mul(
      uniforms.haze,
    );
    const fogFactor = mix(
      hazeFactor,
      float(1),
      rangeFogFactor(uniforms.fogStart, uniforms.fogEnd),
    );

    const viewDirection = normalize(positionWorld.sub(cameraPosition));
    this.scene.fogNode = fog(skyColor(viewDirection), fogFactor);
  }

  setDebug() {
    if (!this.debug.active) return;

    this.debugFolder = this.debug.ui.addFolder({
      title: "Sky",
      expanded: false,
    });

    for (const [name, settings] of Object.entries(SETTINGS)) {
      this.debugFolder
        .addBinding(this.options, name, settings)
        .on("change", (event) => {
          if (isColor(settings)) this.uniforms[name].value.set(event.value);
          else this.uniforms[name].value = event.value;
        });
    }
  }

  destroy() {
    this.scene.backgroundNode = null;
    this.scene.fogNode = null;
    this.debugFolder?.dispose();
  }
}
