import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Experience from "./Experience";

export default class Camera {
  constructor() {
    this.experience = new Experience();

    this.debug = this.experience.debug;
    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Camera");
      this.debugFolder.close();
    }

    this.setInstance();
    // this.setOrbitControls();

    this.mouse = new THREE.Vector2();
    this.target = new THREE.Vector2();
    this.windowHalf = new THREE.Vector2(
      window.innerWidth / 2,
      window.innerHeight / 2
    );

    window.addEventListener(
      "mousemove",
      this.handleMouseMove.bind(this),
      false
    );

    this.setDebug();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      100,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );

    this.instance.position.set(18.616, 5.501, -14.821);
    this.initialRotation = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        0.15419531693037145,
        -1.4982757011949766,
        0.12684288442070207,
        "XYZ"
      )
    );

    this.instance.applyQuaternion(this.initialRotation);
    this.scene.add(this.instance);
  }

  setPositionAndRotation(position, rotation) {
    const rotationEuler = new THREE.Euler(
      rotation._x,
      rotation._y,
      rotation._z,
      "XYZ"
    );
    console.log(position, rotationEuler);
    this.instance.position.set(position.x, position.y, position.z);
    this.instance.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;

    // this.controls.minPolarAngle = THREE.MathUtils.degToRad(30);
    // this.controls.maxPolarAngle = THREE.MathUtils.degToRad(90);
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolderPosition = this.debugFolder.addFolder("Position");
      this.debugFolderPosition.close();
      this.debugFolderPosition
        .add(this.instance.position, "x")
        .min(0)
        .max(100)
        .step(0.01);
      this.debugFolderPosition
        .add(this.instance.position, "y")
        .min(0)
        .max(100)
        .step(0.01);
      this.debugFolderPosition
        .add(this.instance.position, "z")
        .min(0)
        .max(100)
        .step(0.01);
      this.debugFolderRotation = this.debugFolder.addFolder("Rotation");
      this.debugFolderRotation.close();
      this.debugFolderRotation
        .add(this.instance.rotation, "x")
        .min(0)
        .max(360)
        .step(0.01)
        .onChange(() => {
          this.instance.rotation.x = THREE.MathUtils.degToRad(
            this.instance.rotation.x
          );
        });
      this.debugFolderRotation
        .add(this.instance.rotation, "y")
        .min(0)
        .max(360)
        .step(0.01)
        .onChange(() => {
          this.instance.rotation.y = THREE.MathUtils.degToRad(
            this.instance.rotation.y
          );
        });
      this.debugFolderRotation
        .add(this.instance.rotation, "z")
        .min(0)
        .max(360)
        .step(0.01)
        .onChange(() => {
          this.instance.rotation.y = THREE.MathUtils.degToRad(
            this.instance.rotation.z
          );
        });
    }
  }

  handleMouseMove(event) {
    // Calculate normalized device coordinates (NDC)
    this.mouse.x = event.clientX / this.windowHalf.x;
    this.mouse.y = event.clientY / this.windowHalf.x;
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    if (this.controls) this.controls.update();

    // Get the mouse movement
    // const mouseX = (this.mouse.x * 2 - 1) * 0.1;
    // const mouseY = (this.mouse.y * 2 - 1) * 0.1;

    // Create a quaternion for rotating around the local axes
    // const rotationX = new THREE.Quaternion().setFromAxisAngle(
    //   new THREE.Vector3(0, 0, 1),
    //   mouseY
    // );
    // const rotationY = new THREE.Quaternion().setFromAxisAngle(
    //   new THREE.Vector3(0, 1, 0),
    //   mouseX
    // );

    // Combine the rotations with the initial rotation
    // const finalRotation = new THREE.Quaternion();
    // finalRotation
    //   .multiply(rotationX)
    //   .multiply(rotationY)
    //   .multiply(this.initialRotation);

    // Apply the rotation to the camera
    // this.instance.quaternion.copy(finalRotation);
  }
}
