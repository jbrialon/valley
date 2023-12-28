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
    this.manager = this.experience.Manager;
    this.scene = this.experience.scene;
    this.time = this.experience.time;

    this.options = {
      activeCamera: "day1",
    };

    // Setup
    this.isAnimated = false;
    this.scrollProgress = 0;
    this.title = document.querySelectorAll(".js-title");

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
    this.transformControls = this.experience.helpers.transformControls;

    this.cameraCurve = new THREE.CatmullRomCurve3(paths.camera);
    paths.camera.forEach((point, index) => {
      const curvePoint = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshNormalMaterial()
      );
      curvePoint.position.set(point.x, point.y, point.z);
      curvePoint.scale.set(0.1, 0.1, 0.1);
      curvePoint.index = index;
      curvePoint.type = "camera";
      curvePoint.visible = this.debug.active;
      this.scene.add(curvePoint);

      this.manager.addClickEventToMesh(curvePoint, () => {
        this.transformControls.attach(curvePoint);
      });
    });

    this.cameraPoints = this.cameraCurve.getPoints(50);
    this.cameraGeometry = new THREE.BufferGeometry().setFromPoints(
      this.cameraPoints
    );

    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    this.cameraCurveMesh = new THREE.Line(this.cameraGeometry, material);
    this.cameraCurveMesh.visible = this.debug.active;
    this.scene.add(this.cameraCurveMesh);

    this.targetCurve = new THREE.CatmullRomCurve3(paths.target);

    paths.target.forEach((point, index) => {
      const curvePoint = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshNormalMaterial()
      );
      curvePoint.position.set(point.x, point.y, point.z);
      curvePoint.scale.set(0.1, 0.1, 0.1);
      curvePoint.index = index;
      curvePoint.type = "target";
      curvePoint.visible = this.debug.active;
      this.scene.add(curvePoint);

      this.manager.addClickEventToMesh(curvePoint, () => {
        this.transformControls.attach(curvePoint);
      });
    });

    this.targetPoints = this.targetCurve.getPoints(50);
    this.targetGeometry = new THREE.BufferGeometry().setFromPoints(
      this.targetPoints
    );

    this.targetCurveMesh = new THREE.Line(
      this.targetGeometry,
      new THREE.LineBasicMaterial({ color: 0x599fd3 })
    );
    this.targetCurveMesh.visible = this.debug.active;
    this.scene.add(this.targetCurveMesh);

    this.fakeTarget = new THREE.Mesh(
      new THREE.SphereGeometry(1, 16, 16),
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

    this.transformControls.addEventListener("dragging-changed", (event) => {
      if (!event.value) {
        const transformedPoint = this.transformControls.object;
        const index = transformedPoint.index;
        const type = transformedPoint.type;
        if (type === "camera") {
          paths.camera[index] = new THREE.Vector3(
            transformedPoint.position.x,
            transformedPoint.position.y,
            transformedPoint.position.z
          );
          this.cameraCurve = new THREE.CatmullRomCurve3(paths.camera);
          this.cameraPoints = this.cameraCurve.getPoints(50);
          this.cameraGeometry = new THREE.BufferGeometry().setFromPoints(
            this.cameraPoints
          );

          this.cameraCurveMesh.geometry = this.cameraGeometry;
        } else if (type === "target") {
          paths.target[index] = new THREE.Vector3(
            transformedPoint.position.x,
            transformedPoint.position.y,
            transformedPoint.position.z
          );
          this.targetCurve = new THREE.CatmullRomCurve3(paths.target);
          this.targetPoints = this.targetCurve.getPoints(50);
          this.targetGeometry = new THREE.BufferGeometry().setFromPoints(
            this.targetPoints
          );

          this.targetCurveMesh.geometry = this.targetGeometry;
        }
        console.log("New Point Position: ", index, transformedPoint.position);
      }
    });
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
        console.log("Camera Position:", this.instance.position);
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
