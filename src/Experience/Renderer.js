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
    this.manager = this.experience.manager;

    this.raycaster = new THREE.Raycaster();
    this.raycaster.layers.set(1);
    this.raycaster.firstHitOnly = true;

    // Options
    this.options = {
      backgroundColor: "#b9a998",
    };

    // Setup
    this.setInstance();
    this.setInteractionManager();
    this.initEvents();

    // Debug
    this.setDebug();
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });

    // TODO: try to understand that
    THREE.ColorManagement.enabled = false;
    // https://threejs.org/docs/#manual/en/introduction/Color-management
    // discourse.threejs.org/t/updates-to-color-management-in-three-js-r152/50791
    // this.instance.outputColorSpace = THREE.SRGBColorSpace;
    // this.instance.outputColorSpace = THREE.LinearSRGBColorSpace;
    // this.instance.shadowMap.enabled = true;
    // this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.instance.setClearColor(this.options.backgroundColor);

    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  initEvents() {
    this.manager.on("updateColors", (colors) => {
      this.options.backgroundColor = colors[3];
      this.instance.setClearColor(this.options.backgroundColor);
      this.debugFolder.controllers.forEach((controller) => {
        controller.updateDisplay();
      });
    });
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

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("World");
      this.debugFolder.close();
      this.debugFolder
        .addColor(this.options, "backgroundColor")
        .name("Background Color")
        .onChange(() => {
          this.instance.setClearColor(this.options.backgroundColor);
          document.body.style.backgroundColor = this.options.backgroundColor;
        });
    }
  }

  update() {
    this.interactionManager.update();
    this.instance.render(this.scene, this.camera.instance);
  }
}
