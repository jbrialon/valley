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

    this.options = {
      position: new THREE.Vector3(0, 26, 0),
      rotation: new THREE.Vector3(-90, 0, 0),
    };
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
        .name("Print camera value");
      this.debugFolder
        .add(
          {
            button: () => {
              this.animateCameraPosition(
                this.options.position,
                this.options.rotation
              );
              this.instance.lookAt(0, 0, 0);
            },
          },
          "button"
        )
        .name("camera to top");
    }

    this.setInstance();
    // this.setOrbitControls();

    // Debug
    this.setDebug();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );

    this.instance.position.set(
      this.options.position.x,
      this.options.position.y,
      this.options.position.z
    );
    this.instance.rotation.set(
      this.options.rotation.x,
      this.options.rotation.y,
      this.options.rotation.z
    );

    this.instance.lookAt(0, 0, 0);
    this.scene.add(this.instance);
  }

  animateCameraPosition(position, rotation) {
    this.instance.position.set(position.x, position.y + 1, position.z);
    this.instance.rotation.set(rotation.x, rotation.y, rotation.z);

    gsap.to(this.instance.position, {
      y: position.y,
      duration: 1,
      ease: "power4.EaseInOut",
    });
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

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    if (this.controls) this.controls.update();
  }
}
