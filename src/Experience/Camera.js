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
    this.mouseEvents = this.experience.mouseEvents;
    this.manager = this.experience.Manager;
    this.scene = this.experience.scene;
    this.time = this.experience.time;

    this.options = {
      animateCamera: false,
    };

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Camera");
      this.debugFolder.close();
    }

    this.setInstance();
    // this.setOrbitControls();

    // Events
    this.manager.on("cameraPositionChanged", (key) => {
      this.animateCameraPosition(key);
    });

    // Mouse Events
    this.mouseEvents.on("mousemove", () => {
      this.onMouseMove();
    });
    this.mouseEvents.on("wheel", () => {
      this.onMouseWheel();
    });

    // Debug
    this.setDebug();
  }

  onMouseMove(event) {
    // this.mouseEvents.mouse.x = event.clientX - this.windowHalf.x;
    // this.mouseEvents.mouse.y = event.clientY - this.windowHalf.x;
  }

  onMouseWheel() {
    this.instance.translateZ(+this.mouseEvents.mouse.z * 0.1);
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );

    this.instance.position.set(
      camera.top.position.x,
      camera.top.position.y,
      camera.top.position.z
    );
    this.instance.rotation.set(
      camera.top.rotation.x,
      camera.top.rotation.y,
      camera.top.rotation.z
    );

    this.instance.lookAt(
      camera.top.rotation.x,
      camera.top.rotation.y,
      camera.top.rotation.z
    );
    this.scene.add(this.instance);
  }

  animateCameraPosition(name) {
    const camData = camera[name];
    if (camData) {
      this.instance.position.set(
        camData.position.x,
        camData.position.y + 1,
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
