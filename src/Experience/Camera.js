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

    this.options = {
      initialPos: paths.camera[0],
      initialTargetPos: paths.target[0],
    };

    // Setup
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
      this.options.initialPos.x,
      this.options.initialPos.y + 1,
      this.options.initialPos.z
    );

    this.scene.add(this.cameraParent);
    this.cameraParent.add(this.instance);

    this.instance.lookAt(
      this.options.initialTargetPos.x,
      this.options.initialTargetPos.y,
      this.options.initialTargetPos.z
    );
  }

  setPaths() {
    this.cameraCurve = this.experience.world.paths.cameraCurve;
    this.targetCurve = this.experience.world.paths.targetCurve;
    this.fakeTarget = this.experience.world.paths.fakeTarget;
  }

  initEvents() {
    // Mouse Events
    this.inputEvents.on("mousemove", this.onMouseMove.bind(this));
    // Scroll event
    this.inputEvents.on("wheel", this.onMouseWheel.bind(this));
    // Keyboard Events
    this.inputEvents.on("keydown", this.onKeyDown.bind(this));
    // Animation
    this.manager.on("camera-intro-animation", this.introAnimation.bind(this));
    // Camera Zoom
    this.manager.on("camera-zoom", this.zoom.bind(this));
    this.manager.on("camera-unzoom", this.unzoom.bind(this));
  }

  introAnimation() {
    gsap.to(this.cameraParent.position, {
      y: this.options.initialPos.y,
      duration: 3.5,
      ease: "power1.out",
      onUpdate: () => {
        this.instance.lookAt(
          this.options.initialTargetPos.x,
          this.options.initialTargetPos.y,
          this.options.initialTargetPos.z
        );
      },
    });
  }

  zoom() {
    const activeMarker = this.manager.getActiveMarker();
    if (activeMarker) {
      this.previousPosition = this.cameraParent.position.clone();
      // Calculate the new camera position
      const distance = -0.7; // Distance from the marker
      const direction = new THREE.Vector3()
        .subVectors(activeMarker.position, this.cameraParent.position)
        .normalize();
      const newPosition = new THREE.Vector3()
        .copy(direction)
        .multiplyScalar(distance)
        .add(activeMarker.position);

      gsap.to(this.cameraParent.position, {
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
        duration: 2,
        ease: "power2.inOut",
      });
    }
  }

  unzoom() {
    gsap.to(this.cameraParent.position, {
      x: this.previousPosition.x,
      y: this.previousPosition.y,
      z: this.previousPosition.z,
      duration: 2.5,
      ease: "power2.out",
      onStart: () => {
        this.manager.trigger("log-close");
      },
      onComplete: () => {
        this.manager.setZoomState(false);
      },
    });
  }

  onMouseWheel() {
    if (
      this.scrollProgress >= 0 &&
      this.manager.isScrollingEnabled() &&
      !this.manager.getZoomState()
    ) {
      let delta = 0.025;
      if (this.inputEvents.mouse.z < 0) {
        delta = -0.025;
      }

      const targetScrollProgress = this.scrollProgress + delta;
      const clampedScrollProgress = Math.max(
        0,
        Math.min(targetScrollProgress, this.manager.getMaxScrollProgress())
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
        onComplete: () => {
          this.manager.goToTutorialStep(3);
        },
      });
    }
  }

  onMouseMove() {
    if (this.manager.isMouseMoveEnabled()) {
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
        position.x / 8,
        position.y / -8,
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
