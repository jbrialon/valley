import * as THREE from "three/webgpu";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Experience from "./Experience";

export default class Camera {
  constructor() {
    this.experience = new Experience();

    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.debug = this.experience.debug;

    // Looking up the valley from above Syabru Besi
    this.target = new THREE.Vector3(12.11, 35.92, -1.11);

    this.setInstance();
    this.setOrbitControls();
    this.setDebug();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      60,
      this.sizes.width / this.sizes.height,
      0.1,
      300,
    );

    this.instance.position.set(-53.37, 59.87, 8.72);
    this.instance.lookAt(this.target);
    this.scene.add(this.instance);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    this.controls.target.copy(this.target);
    this.controls.update();
  }

  setDebug() {
    if (!this.debug.active) return;

    this.debugFolder = this.debug.ui.addFolder({
      title: "Camera",
      expanded: false,
    });

    const pointSettings = (label) => ({
      label,
      x: { step: 0.01 },
      y: { step: 0.01 },
      z: { step: 0.01 },
    });

    this.debugFolder
      .addBinding(this.instance, "position", pointSettings("pos"))
      .on("change", () => this.controls.update());

    this.debugFolder
      .addBinding(this.controls, "target", pointSettings("look"))
      .on("change", () => this.controls.update());

    this.debugFolder
      .addBinding(this.instance, "fov", { min: 20, max: 120, step: 1 })
      .on("change", () => this.instance.updateProjectionMatrix());

    this.debugFolder
      .addBinding(this.instance, "far", { min: 10, max: 2000, step: 10 })
      .on("change", () => this.instance.updateProjectionMatrix());

    this.debugFolder.addButton({ title: "Copy setup" }).on("click", () => {
      const format = (vector) =>
        `${vector.x.toFixed(2)}, ${vector.y.toFixed(2)}, ${vector.z.toFixed(2)}`;
      const snippet = `this.target = new THREE.Vector3(${format(this.controls.target)});\nthis.instance.position.set(${format(this.instance.position)});`;
      navigator.clipboard?.writeText(snippet);
      console.log(snippet);
    });
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }

  destroy() {
    this.controls.dispose();
  }
}
