import * as THREE from "three";
import { gsap } from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Experience from "./Experience";

import camera from "./Data/camera.js";

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
      animateCamera: false,
      activeCamera: "day1",
    };

    // Debug
    if (this.debug.active) {
      //this.debugFolder = this.debug.ui.addFolder("Camera");
      //this.debugFolder.close();
    }

    // Setup
    this.activeTween = null;
    this.setInstance();
    // this.setOrbitControls();

    // Events
    this.manager.on("cameraPositionChanged", (key) => {
      this.activeTween.kill();
      this.animateCameraPosition(key);
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
      camera.day1.position.x,
      camera.day1.position.y,
      camera.day1.position.z
    );

    this.instance.rotation.set(
      camera.day1.rotation.x,
      camera.day1.rotation.y,
      camera.day1.rotation.z
    );

    this.instance.lookAt(
      camera.day1.target.x,
      camera.day1.target.y,
      camera.day1.target.z
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

  onMouseMove(event) {
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
    this.activeTween = gsap.to(this.instance.position, {
      delay: 0.1,
      x: camera[this.options.activeCamera].position.x + movementVector.x,
      y: camera[this.options.activeCamera].position.y + movementVector.y,
      z: camera[this.options.activeCamera].position.z + movementVector.z,
      duration: 2,
      ease: "power4.easeInOut",
    });
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
        console.log("Camera World Position");
        break;
    }
  }

  animateCameraPosition(name) {
    this.options.activeCamera = name;
    const camData = camera[name];
    if (camData) {
      this.instance.position.set(
        camData.position.x,
        camData.position.y,
        camData.position.z
      );

      this.instance.lookAt(
        camData.target.x,
        camData.target.y,
        camData.target.z
      );

      if (camData.animate) {
        gsap.to(this.instance.position, {
          y: camData.position.y,
          duration: 1,
          ease: "power4.EaseInOut",
          onComplete: () => {
            //this.options.animateCamera = true;
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

    // this.target.x = (1 - this.mouse.x) * 0.0002;
    // this.target.y = (1 - this.mouse.y) * 0.0002;

    if (this.options.animateCamera) {
      // Adjust the translation speed based on mouse position
      // const speed = 1;
      // const translateX = this.target.x * speed * (1 + Math.abs(this.mouse.x));
      // const translateY = this.target.y * speed * (1 + Math.abs(this.mouse.y));
      // console.log(translateX);
      // this.instance.translateX(translateX);
    }
  }
}
