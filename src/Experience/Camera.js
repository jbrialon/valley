import * as THREE from "three";
import { gsap } from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Experience from "./Experience";

import paths from "./Data/paths.js";

export default class Camera {
  constructor() {
    this.experience = new Experience();

    this.debug = this.experience.debug;
    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;
    this.inputEvents = this.experience.inputEvents;
    this.manager = this.experience.manager;
    this.scene = this.experience.scene;
    this.time = this.experience.time;

    this.options = {};

    // Setup
    this.canScroll = false;
    this.isAnimated = false;
    this.scrollProgress = 0;
    this.cameraCurve = null;
    this.targetCurve = null;
    this.fakeTarget = null;
    this.setInstance();
    this.initEvents();
    // this.setOrbitControls();

    // Debug
    this.setDebug();
  }

  setInstance() {
    this.cameraParent = new THREE.Group();
    this.instance = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );

    this.cameraParent.position.set(
      paths.camera[0].x,
      paths.camera[0].y,
      paths.camera[0].z
    );

    this.scene.add(this.cameraParent);
    this.cameraParent.add(this.instance);

    this.instance.lookAt(
      paths.target[0].x,
      paths.target[0].y,
      paths.target[0].z
    );
  }

  setPaths() {
    this.cameraCurve = this.experience.world.paths.cameraCurve;
    this.targetCurve = this.experience.world.paths.targetCurve;
    this.fakeTarget = this.experience.world.paths.fakeTarget;
    this.canScroll = true;
    this.manager.trigger("loaded");
  }

  initEvents() {
    // Mouse Events
    this.inputEvents.on("mousemove", () => {
      this.onMouseMove();
    });
    this.inputEvents.on("wheel", () => {
      this.onMouseWheel();
    });
    // Keyboard Events
    this.inputEvents.on("keydown", (keyCode) => {
      this.onKeyDown(keyCode);
    });
  }

  onMouseWheel() {
    if (this.scrollProgress >= 0 && this.canScroll) {
      let delta = 0.025;
      if (this.inputEvents.mouse.z < 0) {
        delta = -0.025;
      }

      const targetScrollProgress = this.scrollProgress + delta;
      const clampedScrollProgress = Math.max(
        0,
        Math.min(targetScrollProgress, 1)
      );

      gsap.to(this, {
        duration: 1.5,
        scrollProgress: clampedScrollProgress,
        ease: "power2.EaseInOut",
        onUpdate: () => {
          const newPosition = this.cameraCurve.getPointAt(this.scrollProgress);
          const newPosition2 = this.targetCurve.getPointAt(this.scrollProgress);
          this.fakeTarget.position.copy(newPosition2);
          this.cameraParent.position.copy(newPosition);
          this.instance.lookAt(
            this.fakeTarget.position.x,
            this.fakeTarget.position.y,
            this.fakeTarget.position.z
          );
        },
        onStart: () => {
          this.manager.trigger("onScrollStart");
        },
        onComplete: () => {
          this.manager.trigger("onScrollComplete");
        },
      });
    }
  }

  onMouseMove() {
    // calculate the position of the mouse based with center as origin
    const mouse = new THREE.Vector2(
      this.inputEvents.mouse.x - this.sizes.width / 2,
      this.inputEvents.mouse.y - this.sizes.height / 2
    );

    // normalize the mouse position
    const position = new THREE.Vector2(
      mouse.x / (this.sizes.width / 2),
      mouse.y / (this.sizes.height / 2)
    );

    // Create a movement vector based on the mouse position
    const movementVector = new THREE.Vector3(
      position.x / 4,
      position.y / -4,
      0
    );

    // Apply the camera's current rotation to the movement vector
    movementVector.applyQuaternion(this.instance.quaternion);

    // Update the camera's position by adding the transformed movement vector
    gsap.to(this.instance.position, {
      delay: 0.1,
      x: movementVector.x,
      y: movementVector.y,
      z: movementVector.z,
      duration: 2,
      ease: "power4.easeInOut",
    });
  }

  animateMove(direction) {
    // Rotate to camera's orientation
    direction.applyQuaternion(this.instance.quaternion);

    const distanceToMove = 1;
    const newPosition = this.cameraParent.position
      .clone()
      .add(direction.multiplyScalar(distanceToMove));

    gsap.to(this.cameraParent.position, {
      x: newPosition.x,
      y: newPosition.y,
      z: newPosition.z,
      duration: 2, // Set the duration of the animation
      ease: "power4.easeInOut",
    });
  }

  onKeyDown(keyCode) {
    const moveDistance = 0.1;
    let direction = new THREE.Vector3(0, 0, 0);
    switch (keyCode) {
      case "ArrowUp":
        direction = new THREE.Vector3(0, moveDistance, 0);
        this.animateMove(direction);
        break;
      case "ArrowDown":
        direction = new THREE.Vector3(0, -moveDistance, 0);
        this.animateMove(direction);
        break;
      case "ArrowLeft":
        direction = new THREE.Vector3(-moveDistance, 0, 0);
        this.animateMove(direction);
        break;
      case "ArrowRight":
        direction = new THREE.Vector3(moveDistance, 0, 0);
        this.animateMove(direction);
        break;
      case "Space":
        console.log(
          "Camera Position:",
          `new THREE.Vector3(${this.cameraParent.position.x.toFixed(
            2
          )},${this.cameraParent.position.y.toFixed(
            2
          )},${this.cameraParent.position.z.toFixed(2)})`
        );
        break;
    }
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
  }

  setDebug() {
    if (this.debug.active) {
      //this.debugFolder = this.debug.ui.addFolder("Camera");
      //this.debugFolder.close();
    }
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    if (this.controls) this.controls.update();
  }
}
