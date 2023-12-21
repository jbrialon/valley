import * as THREE from "three";
import Experience from "./Experience";
import { InteractionManager } from "three.interactive";

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
      clearColor: "#968677",
    };

    // Setup

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("World");
      this.debugFolder.close();
      this.debugFolder
        .addColor(this.options, "clearColor")
        .name("Background Color")
        .onChange(() => {
          this.instance.setClearColor(this.options.clearColor);
        });
    }

    this.setInstance();
    this.setInteractionManager();
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance",
    });

    // TODO: try to understand that
    THREE.ColorManagement.enabled = false;
    // discourse.threejs.org/t/updates-to-color-management-in-three-js-r152/50791
    // this.instance.outputColorSpace = THREE.SRGBColorSpace;
    // this.instance.outputColorSpace = THREE.LinearSRGBColorSpace;
    // this.instance.shadowMap.enabled = true;
    // this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.instance.setClearColor(this.options.clearColor);

    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  setInteractionManager() {
    this.interactionManager = new InteractionManager(
      this.instance,
      this.camera.instance,
      this.canvas
    );
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
  }

  update() {
    this.instance.render(this.scene, this.camera.instance);
  }
}
