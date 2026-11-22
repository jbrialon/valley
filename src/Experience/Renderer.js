import * as THREE from "three/webgpu";
import Experience from "./Experience";

export default class Renderer {
  constructor() {
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;

    // Options
    this.options = {
      // Same as the sky horizon, it's what the loader fades from
      clearColor: 0xc5d3dd,
      toneMapping: THREE.NeutralToneMapping,
      toneMappingExposure: 1,
    };
  }

  async setInstance() {
    this.instance = new THREE.WebGPURenderer({
      canvas: this.canvas,
      forceWebGL: false,
      antialias: true,
      powerPreference: "high-performance",
    });

    await this.instance.init();

    THREE.ColorManagement.enabled = true;
    this.instance.outputColorSpace = THREE.SRGBColorSpace;
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFShadowMap;
    this.instance.setClearColor(this.options.clearColor);

    this.instance.toneMapping = this.options.toneMapping;
    this.instance.toneMappingExposure = this.options.toneMappingExposure;

    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);

    this.setDebug();
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder({
        title: "Experience",
        expanded: false,
      });
      this.debugFolder
        .addBinding(this.options, "clearColor", {
          label: "Background",
          view: "color",
        })
        .on("change", () => {
          this.instance.setClearColor(this.options.clearColor);
        });
      // Tone Mapping
      this.debugFolder
        .addBinding(this.options, "toneMapping", {
          options: {
            None: THREE.NoToneMapping,
            Linear: THREE.LinearToneMapping,
            Reinhard: THREE.ReinhardToneMapping,
            Cineon: THREE.CineonToneMapping,
            ACESFilmic: THREE.ACESFilmicToneMapping,
            AgX: THREE.AgXToneMapping,
            Neutral: THREE.NeutralToneMapping,
          },
        })
        .on("change", () => {
          this.instance.toneMapping = Number(this.options.toneMapping);
        });
      // Tone Mapping Exposure
      this.debugFolder
        .addBinding(this.options, "toneMappingExposure", {
          label: "Exposure",
          min: 0,
          max: 2,
          step: 0.01,
        })
        .on("change", () => {
          this.instance.toneMappingExposure = this.options.toneMappingExposure;
        });
    }
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
  }

  update() {
    this.instance.render(this.scene, this.camera.instance);
  }
}
