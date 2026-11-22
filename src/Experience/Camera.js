import * as THREE from "three/webgpu";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

import Experience from "./Experience";

export default class Camera {
  constructor() {
    this.experience = new Experience();

    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.debug = this.experience.debug;

    // Looking up the valley from above Syabru Besi
    this.target = new THREE.Vector3(12.11, 35.92, -1.11);

    // Options
    this.options = {
      // Scene units per second
      speed: 40,
      // Speed multiplier while holding Shift
      sprint: 4,
      // Higher starts and stops faster
      damping: 12,
      pointerSpeed: 0.6,
      // How close to the ground the camera can get
      groundClearance: 2,
      maxHeight: 200,
    };

    // Set once the terrain exists, gives the ground height under a position or null
    this.getGroundHeight = null;

    this.setInstance();
    this.setOrbitControls();
    this.setFlyControls();
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

  // Fly mode
  setFlyControls() {
    this.fly = new PointerLockControls(this.instance, this.canvas);
    this.fly.pointerSpeed = this.options.pointerSpeed;

    this.keys = new Set();
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    this.fly.addEventListener("lock", () => {
      this.controls.enabled = false;
      this.velocity.set(0, 0, 0);
    });

    this.fly.addEventListener("unlock", () => {
      this.keys.clear();
      // Back in orbit mode
      this.instance.getWorldDirection(this.direction);
      this.target
        .copy(this.instance.position)
        .addScaledVector(this.direction, 50);
      this.controls.target.copy(this.target);
      this.controls.enabled = true;
      this.controls.update();
    });

    this.onKeyDown = (event) => {
      if (event.code === "KeyF" && !event.repeat) {
        if (this.fly.isLocked) this.fly.unlock();
        else this.fly.lock();
        return;
      }
      if (this.fly.isLocked) this.keys.add(event.code);
    };

    this.onKeyUp = (event) => {
      this.keys.delete(event.code);
    };

    this.onWheel = (event) => {
      if (!this.fly.isLocked) return;
      event.preventDefault();
      this.options.speed = THREE.MathUtils.clamp(
        this.options.speed * (event.deltaY < 0 ? 1.1 : 0.9),
        1,
        500,
      );
    };

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    this.canvas.addEventListener("wheel", this.onWheel, { passive: false });
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
      .on("change", () => {
        if (!this.fly.isLocked) this.controls.update();
      });

    this.debugFolder
      .addBinding(this, "target", pointSettings("look"))
      .on("change", () => {
        this.controls.target.copy(this.target);
        if (this.fly.isLocked) this.instance.lookAt(this.target);
        else this.controls.update();
      });

    this.debugFolder
      .addBinding(this.instance, "fov", { min: 20, max: 120, step: 1 })
      .on("change", () => this.instance.updateProjectionMatrix());

    this.debugFolder
      .addBinding(this.instance, "far", { min: 10, max: 2000, step: 10 })
      .on("change", () => this.instance.updateProjectionMatrix());

    this.debugFolder.addBinding(this.options, "speed", {
      min: 1,
      max: 500,
      step: 1,
    });
    this.debugFolder.addBinding(this.options, "sprint", {
      min: 1,
      max: 20,
      step: 0.5,
    });
    this.debugFolder.addBinding(this.options, "damping", {
      min: 1,
      max: 40,
      step: 1,
    });
    this.debugFolder
      .addBinding(this.options, "pointerSpeed", {
        label: "mouse",
        min: 0.1,
        max: 2,
        step: 0.05,
      })
      .on("change", (event) => (this.fly.pointerSpeed = event.value));
    this.debugFolder.addBinding(this.options, "groundClearance", {
      label: "clearance",
      min: 0,
      max: 20,
      step: 0.1,
    });
    this.debugFolder.addBinding(this.options, "maxHeight", {
      label: "max height",
      min: 10,
      max: 1000,
      step: 10,
    });

    this.debugFolder
      .addButton({ title: "Fly mode (F)" })
      .on("click", () => this.fly.lock());

    this.debugFolder.addButton({ title: "Copy setup" }).on("click", () => {
      const format = (vector) =>
        `${vector.x.toFixed(2)}, ${vector.y.toFixed(2)}, ${vector.z.toFixed(2)}`;
      const snippet = `this.target = new THREE.Vector3(${format(this.target)});\nthis.instance.position.set(${format(this.instance.position)});`;
      navigator.clipboard?.writeText(snippet);
      console.log(snippet);
    });
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  updateFly(deltaSeconds) {
    const isSprinting =
      this.keys.has("ShiftLeft") || this.keys.has("ShiftRight");
    const speed = this.options.speed * (isSprinting ? this.options.sprint : 1);

    const forward =
      (this.keys.has("KeyW") ? 1 : 0) - (this.keys.has("KeyS") ? 1 : 0);
    const strafe =
      (this.keys.has("KeyD") ? 1 : 0) - (this.keys.has("KeyA") ? 1 : 0);
    const rise =
      (this.keys.has("Space") || this.keys.has("KeyE") ? 1 : 0) -
      (this.keys.has("KeyC") || this.keys.has("KeyQ") ? 1 : 0);

    // Moves the way the camera looks, so looking down and going forward dives
    this.direction
      .set(strafe, 0, -forward)
      .applyQuaternion(this.instance.quaternion);
    this.direction.y += rise;
    if (this.direction.lengthSq() > 0) this.direction.normalize();

    // Speeds up and slows down smoothly, the same at any frame rate
    const blend = 1 - Math.exp(-this.options.damping * deltaSeconds);
    this.velocity.lerp(this.direction.multiplyScalar(speed), blend);

    this.instance.position.addScaledVector(this.velocity, deltaSeconds);
  }

  // Keeps the camera above the ground and below the max height
  clampHeight() {
    const position = this.instance.position;
    const groundHeight = this.getGroundHeight?.(position) ?? null;
    if (groundHeight !== null) {
      position.y = Math.max(
        position.y,
        groundHeight + this.options.groundClearance,
      );
    }
    position.y = Math.min(position.y, this.options.maxHeight);
  }

  update() {
    // Capped so coming back to a paused tab doesn't throw the camera far away
    const deltaSeconds = Math.min(this.time.delta / 1000, 0.1);

    if (this.fly.isLocked) {
      this.updateFly(deltaSeconds);
      this.debugFolder?.refresh();
    } else if (this.controls.enabled) {
      this.controls.update();
    }

    this.clampHeight();
  }

  destroy() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.canvas.removeEventListener("wheel", this.onWheel);
    this.fly.dispose();
    this.controls.dispose();
  }
}
