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
    };

    // Debug
    if (this.debug.active) {
      //this.debugFolder = this.debug.ui.addFolder("Camera");
      //this.debugFolder.close();
    }

    this.setInstance();
    // this.setOrbitControls();

    // Events
    this.manager.on("cameraPositionChanged", (key) => {
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

  onMouseMove(event) {
    // this.mouseEvents.mouse.x = event.clientX - this.windowHalf.x;
    // this.mouseEvents.mouse.y = event.clientY - this.windowHalf.x;
  }

  onMouseWheel() {
    if (this.inputEvents.mouse.z > 0) {
      this.animateMove(new THREE.Vector3(0, 0, 1));
    } else if (this.inputEvents.mouse.z < 0) {
      this.animateMove(new THREE.Vector3(0, 0, -1));
    }
    //this.animateMove(direction);
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
