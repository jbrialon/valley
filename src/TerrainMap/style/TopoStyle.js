import * as THREE from "three/webgpu";
import { uniform } from "three/tsl";

// Azimuth 0 is north and 90 is east, elevation 0 is the horizon
function sunDirectionFromAngles(azimuth, elevation, target) {
  const azimuthRadians = THREE.MathUtils.degToRad(azimuth);
  const elevationRadians = THREE.MathUtils.degToRad(elevation);
  return target.set(
    Math.sin(azimuthRadians) * Math.cos(elevationRadians),
    Math.sin(elevationRadians),
    -Math.cos(azimuthRadians) * Math.cos(elevationRadians),
  );
}

// The sun angles aren't sent to the shader as is, they get turned into one sunDirection
const SUN_SETTINGS = {
  sunAzimuth: { label: "Sun azimuth", min: 0, max: 360, step: 1 },
  sunElevation: { label: "Sun elevation", min: 0, max: 90, step: 1 },
};

// One debug folder per group, each setting is sent to the shader under the same name
const SETTING_FOLDERS = {
  Palette: {
    paletteCurve: { label: "Curve", min: 0.3, max: 3, step: 0.01 },
    reliefMinRange: { label: "Min range (m)", min: 1, max: 2000, step: 10 },
  },
  Light: {
    matte: { label: "Matte", min: 0, max: 1, step: 0.01 },
    lightWrap: { label: "Light wrap", min: 0, max: 1, step: 0.01 },
    lightColor: { label: "Light color", view: "color" },
    shadowColor: { label: "Shadow color", view: "color" },
  },
  Lines: {
    lineColor: { label: "Color", view: "color" },
    lineSpacing: { label: "Step", min: 10, max: 500, step: 5 },
    lineOffset: { label: "Offset", min: 0, max: 500, step: 1 },
    lineThickness: { label: "Thickness", min: 0, max: 3, step: 0.005 },
    emphasisEvery: { label: "Emphasis every", min: 2, max: 12, step: 1 },
    fadeStart: { label: "Fade start", min: 0, max: 600, step: 1 },
    fadeDistance: { label: "Fade distance", min: 1, max: 1000, step: 1 },
  },
  Water: {
    water: { label: "Color", view: "color" },
  },
  Grain: {
    grain: { label: "Strength", min: 0, max: 0.5, step: 0.005 },
    meshGrain: { label: "On the mesh" },
    grainScale: { label: "Scale", min: 0.2, max: 3, step: 0.05 },
    grainSpeed: { label: "Changes / s", min: 0, max: 30, step: 0.5 },
  },
};

export const PALETTE_WIDTH = 256;

const isColor = (settings) => settings.view === "color";

// The shader can't read true or false, so a checkbox becomes 0 or 1
const toUniformValue = (value) =>
  typeof value === "boolean" ? Number(value) : value;

// One set of uniforms shared by every tile, so a change restyles the whole map at once
export default class TopoStyle {
  constructor(options = {}) {
    this.options = Object.assign(
      {
        // Image that gives the light and shadows, the ground color gets multiplied by it
        matcap: null,
        // 0 is the shiny matcap, 1 is the flat light from the sun
        matte: 0.55,
        sunAzimuth: 315,
        sunElevation: 45,
        // 0 gives sharp shadows, 1 lets the light wrap around so shadows get soft
        lightWrap: 0.5,
        lightColor: "#c8d6d2",
        shadowColor: "#6b6a5e",
        // Colors from the valley floor to the peaks around, evenly spaced
        palette: [
          "#DCCDAF",
          "#CFC099",
          "#B6B489",
          "#94A87A",
          "#6E9068",
          "#4E7659",
          "#3B5E52",
          "#334A55",
          "#2C3B52",
          "#27324F",
          "#8E8CA0",
          "#EDE2CB",
        ],
        // Under 1 gives the low valleys more of the colors
        paletteCurve: 1,
        // Hills smaller than this don't get the whole gradient, so plains stay in the low colors
        reliefMinRange: 300,
        lineColor: "#e1dfde",
        // Spacing and offset are in real meters
        lineSpacing: 50,
        lineOffset: 0,
        lineThickness: 0.005,
        emphasisEvery: 5,
        // Only the emphasized lines stay visible past this camera distance
        fadeStart: 80,
        fadeDistance: 150,
        water: "#7e9ba6",
        grain: 0.1,
        // Off is a film grain on the screen, on sticks the grain to the ground
        meshGrain: true,
        // Size of the mesh grain in screen pixels, roughly
        grainScale: 0.7,
        // How many times per second the mesh grain gets a new pattern, 0 keeps it still
        grainSpeed: 0,
      },
      options,
    );

    this.setUniforms();
  }

  setUniforms() {
    this.uniforms = {};

    for (const folderSettings of Object.values(SETTING_FOLDERS)) {
      for (const [name, settings] of Object.entries(folderSettings)) {
        const value = this.options[name];
        this.uniforms[name] = uniform(
          isColor(settings) ? new THREE.Color(value) : toUniformValue(value),
        );
      }
    }

    this.uniforms.sunDirection = uniform(new THREE.Vector3());
    this.updateSun();

    this.paletteTexture = new THREE.DataTexture(
      new Uint8Array(PALETTE_WIDTH * 4),
      PALETTE_WIDTH,
      1,
    );
    this.paletteTexture.colorSpace = THREE.SRGBColorSpace;
    this.paletteTexture.minFilter = THREE.LinearFilter;
    this.paletteTexture.magFilter = THREE.LinearFilter;
    this.paletteTexture.generateMipmaps = false;
    this.updatePalette();
  }

  // Paints the colors as one strip of pixels, the shader picks a pixel based on the height
  updatePalette() {
    const colors = this.options.palette.map((hex) =>
      new THREE.Color().setStyle(hex, THREE.NoColorSpace),
    );
    const data = this.paletteTexture.image.data;
    const blended = new THREE.Color();

    for (let pixel = 0; pixel < PALETTE_WIDTH; pixel++) {
      const position = (pixel / (PALETTE_WIDTH - 1)) * (colors.length - 1);
      const before = Math.min(Math.floor(position), colors.length - 2);
      blended.lerpColors(colors[before], colors[before + 1], position - before);

      data[pixel * 4] = Math.round(blended.r * 255);
      data[pixel * 4 + 1] = Math.round(blended.g * 255);
      data[pixel * 4 + 2] = Math.round(blended.b * 255);
      data[pixel * 4 + 3] = 255;
    }

    this.paletteTexture.needsUpdate = true;
  }

  updateSun() {
    sunDirectionFromAngles(
      this.options.sunAzimuth,
      this.options.sunElevation,
      this.uniforms.sunDirection.value,
    );
  }

  setDebug(folder) {
    const subfolders = {};

    for (const [title, folderSettings] of Object.entries(SETTING_FOLDERS)) {
      const subfolder = folder.addFolder({ title, expanded: false });
      subfolders[title] = subfolder;

      for (const [name, settings] of Object.entries(folderSettings)) {
        subfolder
          .addBinding(this.options, name, settings)
          .on("change", (event) => {
            if (isColor(settings)) this.uniforms[name].value.set(event.value);
            else this.uniforms[name].value = toUniformValue(event.value);
          });
      }
    }

    for (const [name, settings] of Object.entries(SUN_SETTINGS)) {
      subfolders.Light.addBinding(this.options, name, settings).on(
        "change",
        () => this.updateSun(),
      );
    }

    const palette = this.options.palette;
    for (let index = 0; index < palette.length; index++) {
      const label =
        index === 0
          ? "Valley"
          : index === palette.length - 1
            ? "Summit"
            : `${index + 1}`;
      subfolders.Palette.addBinding(palette, index, {
        label,
        view: "color",
      }).on("change", () => this.updatePalette());
    }
  }

  // The matcap came from outside, so it isn't thrown away here
  dispose() {
    this.paletteTexture.dispose();
  }
}
