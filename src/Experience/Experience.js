import * as THREE from "three";

import Sizes from "./Utils/Sizes.js";
import InputEvents from "./Utils/InputEvents.js";

import Time from "./Utils/Time.js";
import Resources from "./Utils/Resources.js";
import Debug from "./Utils/Debug.js";
import Stats from "./Utils/Stats.js";

import Camera from "./Camera.js";
import Manager from "./Manager.js";
import Helpers from "./Helpers.js";
import Renderer from "./Renderer.js";

import World from "./World/World.js";

import sources from "./sources.js";

let instance = null;

export default class Experience {
  constructor(canvas) {
    // Singleton
    if (instance) {
      return instance;
    }
    instance = this;

    // Global access
    window.experience = this;

    // Options
    this.canvas = canvas;

    // Setup
    this.debug = new Debug();
    this.stats = new Stats();
    this.sizes = new Sizes();
    this.inputEvents = new InputEvents();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.manager = new Manager();
    this.resources = new Resources(sources);
    this.camera = new Camera();
    this.helpers = new Helpers();
    this.renderer = new Renderer();

    // World
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
    this.helpers.update();
    this.renderer.update();
    this.stats.end();
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

    this.camera.controls.dispose();
    this.renderer.instance.dispose();
    if (this.debug.active) {
      this.debug.ui.destroy();
    }
  }
}
