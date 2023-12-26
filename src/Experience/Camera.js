import * as THREE from "three";
import { gsap } from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Experience from "./Experience";

import scenes from "./Data/scenes.js";
import paths from "./Data/paths.js";

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

    // Setup
    this.isAnimated = false;
    this.scrollProgress = 0;

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
      scenes.day1.position.x,
      scenes.day1.position.y,
      scenes.day1.position.z
    );

    this.scene.add(this.cameraParent);
    this.cameraParent.add(this.instance);

    this.instance.lookAt(
      scenes.day1.target.x,
      scenes.day1.target.y,
      scenes.day1.target.z
    );
  }

  setPaths() {
    this.cameraCurve = new THREE.CatmullRomCurve3(paths.camera);

    paths.camera.forEach((point, index) => {
      const curvePoint = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshNormalMaterial()
      );
      curvePoint.position.set(point.x, point.y, point.z);
      curvePoint.scale.set(0.1, 0.1, 0.1);
      curvePoint.visible = this.debug.active;
      this.scene.add(curvePoint);

      this.manager.addClickEventToMesh(curvePoint, () => {
        console.log(index, point);
      });
    });

    const cameraPoints = this.cameraCurve.getPoints(50);
    const cameraGeometry = new THREE.BufferGeometry().setFromPoints(
      cameraPoints
    );

    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    const cameraCurveMesh = new THREE.Line(cameraGeometry, material);
    cameraCurveMesh.visible = this.debug.active;
    this.scene.add(cameraCurveMesh);

    this.targetCurve = new THREE.CatmullRomCurve3(paths.target);

    paths.target.forEach((point, index) => {
      const curvePoint = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshNormalMaterial()
      );
      curvePoint.position.set(point.x, point.y, point.z);
      curvePoint.scale.set(0.1, 0.1, 0.1);
      curvePoint.visible = this.debug.active;
      this.scene.add(curvePoint);

      this.manager.addClickEventToMesh(curvePoint, () => {
        console.log(index, point);
      });
    });

    const targetPoints = this.targetCurve.getPoints(50);
    const targetGeometry = new THREE.BufferGeometry().setFromPoints(
      targetPoints
    );

    const targetCurveMesh = new THREE.Line(
      targetGeometry,
      new THREE.LineBasicMaterial({ color: 0x599fd3 })
    );
    targetCurveMesh.visible = this.debug.active;
    this.scene.add(targetCurveMesh);

    this.fakeTarget = new THREE.Mesh(
      new THREE.SphereGeometry(1, 4, 4),
      new THREE.MeshNormalMaterial()
    );
    this.fakeTarget.scale.set(0.1, 0.1, 0.1);
    this.fakeTarget.position.set(
      paths.target[0].x,
      paths.target[0].y,
      paths.target[0].z
    );
    this.fakeTarget.visible = this.debug.active;
    this.scene.add(this.fakeTarget);
  }

  initEvents() {
    this.manager.on("cameraPositionChanged", (key) => {
      this.updateCameraPosition(key);
    });

    this.manager.on("cameraMoveToNextDay", () => {
      const currentDay = scenes.day1;
      const nextDay = scenes.day2;

      gsap.to(this.cameraParent.position, {
        duration: 10,
        motionPath: {
          path: [
            {
              x: currentDay.position.x,
              y: currentDay.position.y,
              z: currentDay.position.z,
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
  }

  onMouseWheel() {
    if (this.scrollProgress >= 0) {
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
        duration: 1,
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
      });
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
        console.log("Camera Position:", this.instance.position);
        break;
    }
  }

  updateCameraPosition(name) {
    this.isAnimated = true;
    this.options.activeCamera = name;
    const scene = scenes[name];
    if (scene) {
      this.cameraParent.position.set(
        scene.position.x,
        scene.position.y + 1,
        scene.position.z
      );

      this.instance.lookAt(scene.target.x, scene.target.y, scene.target.z);

      if (scene.animate) {
        gsap.to(this.cameraParent.position, {
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
