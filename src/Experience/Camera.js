import * as THREE from "three";
import { gsap } from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Experience from "./Experience";

import scenes from "./Data/scenes.js";

export default class Camera {
  constructor() {
    this.experience = new Experience();

    this.debug = this.experience.debug;
    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;
    this.inputEvents = this.experience.inputEvents;
    this.manager = this.experience.Manager;
    this.scene = this.experience.scene;
    this.time = this.experience.time;

    this.options = {
      activeCamera: "day1",
    };

    // Debug
    if (this.debug.active) {
      //this.debugFolder = this.debug.ui.addFolder("Camera");
      //this.debugFolder.close();
    }

    // Setup
    this.isAnimated = false;
    this.setInstance();
    // this.setOrbitControls();

    // Events
    this.manager.on("cameraPositionChanged", (key) => {
      this.animateCameraPosition(key);
    });

    this.manager.on("cameraMoveToNextDay", () => {
      const currentDay = scenes.day1;
      const nextDay = scenes.day2;
      console.log(nextDay.position);

      gsap.to(this.instance.position, {
        duration: 10,
        motionPath: {
          path: [
            {
              x: this.instance.position.x,
              y: this.instance.position.y,
              z: this.instance.position.z,
            },
            {
              x: nextDay.position.x,
              y: nextDay.position.y,
              z: nextDay.position.z,
            },
          ],
        },
        ease: "power1.inOut",
        onComplete: () => {
          this.options.activeCamera = "day2";
        },
      });
    });

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

    // Debug
    //this.setDebug();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );

    this.instance.position.set(
      scenes.day1.position.x,
      scenes.day1.position.y,
      scenes.day1.position.z
    );

    this.instance.rotation.set(
      scenes.day1.rotation.x,
      scenes.day1.rotation.y,
      scenes.day1.rotation.z
    );

    this.instance.lookAt(
      scenes.day1.target.x,
      scenes.day1.target.y,
      scenes.day1.target.z
    );

    this.scene.add(this.instance);
  }

  onMouseWheel() {
    if (this.inputEvents.mouse.z > 0) {
      this.animateMove(new THREE.Vector3(0, 0, 1));
    } else if (this.inputEvents.mouse.z < 0) {
      this.animateMove(new THREE.Vector3(0, 0, -1));
    }
  }

  onMouseMove() {
    if (!this.isAnimated) {
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
        x: scenes[this.options.activeCamera].position.x + movementVector.x,
        y: scenes[this.options.activeCamera].position.y + movementVector.y,
        z: scenes[this.options.activeCamera].position.z + movementVector.z,
        duration: 2,
        ease: "power4.easeInOut",
      });
    }
  }

  animateMove(direction) {
    direction.applyQuaternion(this.instance.quaternion); // Rotate to camera's orientation

    const distanceToMove = 1;
    const newPosition = this.instance.position
      .clone()
      .add(direction.multiplyScalar(distanceToMove));

    gsap.to(this.instance.position, {
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
        console.log("Camera Position:", this.instance.position);
        break;
    }
  }

  animateCameraPosition(name) {
    this.isAnimated = true;
    this.options.activeCamera = name;
    const scene = scenes[name];
    if (scene) {
      this.instance.position.set(
        scene.position.x,
        scene.position.y + 1,
        scene.position.z
      );

      this.instance.lookAt(scene.target.x, scene.target.y, scene.target.z);

      if (scene.animate) {
        gsap.to(this.instance.position, {
          y: scene.position.y,
          duration: 1,
          ease: "power4.EaseInOut",
          onComplete: () => {
            this.isAnimated = false;
          },
        });
      }
    }
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
  }

  setDebug() {
    if (this.debug.active) {
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
