import * as THREE from "three/webgpu";

import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Resources from "./Utils/Resources.js";
import Debug from "./Utils/Debug.js";
import Stats from "./Utils/Stats.js";

import Camera from "./Camera.js";
import Renderer from "./Renderer.js";

import World from "./World/World.js";

import sources from "./sources.js";

let instance = null;

export default class Experience {
  constructor(_options = {}) {
    // Singleton
    if (instance) {
      return instance;
    }
    instance = this;

    // Global access
    window.experience = this;

    // Options
    this.canvas = _options.canvas || null;
    this.targetElement = _options.targetElement || null;

    if (!this.targetElement || !this.canvas) {
      console.warn(
        `Missing properties:  ${
          !this.targetElement ? "'targetElement' " : ""
        } ${!this.canvas ? "'canvas'" : ""}`,
      );
      return;
    }

    this.init();
  }

  async init() {
    // Setup
    this.debug = new Debug();
    this.stats = new Stats();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources(sources);
    this.camera = new Camera();
    this.renderer = new Renderer();

    await this.renderer.setInstance();

    // World
    this.stats.init(this.renderer.instance);
    this.world = new World();

    // Sizes resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.stats.begin();
    this.camera.update();
    this.world.update();
    this.renderer.update();
    this.stats.end();
    this.stats.update();
  }

  destroy() {
    this.sizes.off("resize");
    this.time.off("tick");

    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        for (const key in child.material) {
          const value = child.material[key];
          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });

    this.camera.destroy();
    this.renderer.instance.dispose();
    this.debug.ui.destroy();
  }
}
