import * as THREE from "three/webgpu";
import {
  Fn,
  cameraPosition,
  dot,
  fog,
  fract,
  max,
  mix,
  normalize,
  positionWorld,
  positionWorldDirection,
  rangeFogFactor,
  screenCoordinate,
  sin,
  smoothstep,
  time,
  uniform,
  vec2,
} from "three/tsl";

import Experience from "../Experience";

// One debug folder per group, each setting is sent to the shader under the same name
const SETTING_FOLDERS = {
  Sky: {
    zenith: { label: "Zenith", view: "color" },
    mid: { label: "Mid", view: "color" },
    horizon: { label: "Horizon", view: "color" },
    midHeight: { label: "Mid height", min: 0.01, max: 1, step: 0.01 },
    zenithHeight: { label: "Zenith height", min: 0.01, max: 1, step: 0.01 },
    grain: { label: "Grain", min: 0, max: 0.5, step: 0.005 },
  },
  Fog: {
    fogColor: { label: "Color", view: "color" },
    fogStart: { label: "Start", min: 0, max: 1000, step: 1 },
    fogEnd: { label: "End", min: 0, max: 1000, step: 1 },
  },
};

const isColor = (settings) => settings.view === "color";

// A sky gradient behind the map, and a fog that fades the far terrain into the sky behind it
export default class Sky {
  constructor({ fogStart = 100, fogEnd = 250 } = {}) {
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;

    // Options
    this.options = {
      zenith: "#2F5F86",
      mid: "#8DB4C4",
      horizon: "#EFE5CE",
      // How high each color sits, 0 is the horizon and 1 is straight up
      midHeight: 0.2,
      zenithHeight: 0.6,
      grain: 0.06,
      // Haze in the middle distance, the far edge still ends in the sky color
      fogColor: "#D6DCD2",
      fogStart,
      fogEnd,
    };

    // Setup
    this.setUniforms();
    this.setNodes();

    // Debug
    this.setDebug();
  }

  setUniforms() {
    this.uniforms = {};
    for (const folderSettings of Object.values(SETTING_FOLDERS)) {
      for (const [name, settings] of Object.entries(folderSettings)) {
        const value = this.options[name];
        this.uniforms[name] = uniform(
          isColor(settings) ? new THREE.Color(value) : value,
        );
      }
    }
  }

  setNodes() {
    const uniforms = this.uniforms;

    // Same film grain as the terrain, a new random value per pixel that shimmers over time
    const grain = fract(
      sin(
        dot(screenCoordinate.xy.add(time.mul(0.0002)), vec2(12.9898, 78.233)),
      ).mul(43758.5453),
    )
      .sub(0.5)
      .mul(uniforms.grain);

    const skyColor = Fn(([direction]) => {
      // Below the horizon stays the horizon color
      const height = max(direction.y, 0);
      const lowSky = mix(
        uniforms.horizon,
        uniforms.mid,
        smoothstep(0, uniforms.midHeight, height),
      );
      // The fog gets the grain too, so a fully fogged mountain matches the sky right next to it
      return mix(
        lowSky,
        uniforms.zenith,
        smoothstep(uniforms.midHeight, uniforms.zenithHeight, height),
      ).add(grain);
    });

    this.scene.backgroundNode = skyColor(positionWorldDirection);

    // The terrain first goes through the haze, then into the sky color in the same direction
    const viewDirection = normalize(positionWorld.sub(cameraPosition));
    const fogFactor = rangeFogFactor(uniforms.fogStart, uniforms.fogEnd);
    const fogColor = mix(uniforms.fogColor, skyColor(viewDirection), fogFactor);
    this.scene.fogNode = fog(fogColor, fogFactor);
  }

  setDebug() {
    if (!this.debug.active) return;

    this.debugFolder = this.debug.ui.addFolder({
      title: "Sky",
      expanded: false,
    });

    for (const [title, folderSettings] of Object.entries(SETTING_FOLDERS)) {
      const subfolder = this.debugFolder.addFolder({ title, expanded: false });

      for (const [name, settings] of Object.entries(folderSettings)) {
        subfolder
          .addBinding(this.options, name, settings)
          .on("change", (event) => {
            if (isColor(settings)) this.uniforms[name].value.set(event.value);
            else this.uniforms[name].value = event.value;
          });
      }
    }
  }

  destroy() {
    this.scene.backgroundNode = null;
    this.scene.fogNode = null;
    this.debugFolder?.dispose();
  }
}
