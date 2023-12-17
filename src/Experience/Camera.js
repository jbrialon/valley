import * as THREE from "three";
import { gsap } from "gsap";
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
      // this.debugFolder.close();
      this.debugFolder
        .add(
          {
            button: () => {
              console.log(this.instance.position, this.instance.rotation);
            },
          },
          "button"
        )
        .name("print camera value");
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

    // Debug
    // this.setDebug();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );

    this.instance.position.set(
      -8.104594951108977,
      8.028910435129925,
      -2.4037926450420994
    );
    this.initialRotation = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        -1.0953606794264232,
        -1.0345297883673101,
        -1.031190012857037,
        "XYZ"
      )
    );

    this.instance.applyQuaternion(this.initialRotation);
    this.scene.add(this.instance);
  }

  setPositionAndRotation(position, rotation, name) {
    if (this.debug.active) {
      this.debugFolder
        .add(
          {
            button: () => {
              this.instance.position.set(
                position.x,
                position.y + 1,
                position.z
              );
              this.instance.rotation.set(rotation.x, rotation.y, rotation.z);

              gsap.to(this.instance.position, {
                y: position.y,
                duration: 1,
                ease: "power4.EaseInOut",
              });
            },
          },
          "button"
        )
        .name(name);
    }
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
