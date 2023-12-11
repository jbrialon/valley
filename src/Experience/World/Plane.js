import * as THREE from "three";
import Experience from "../Experience";

export default class Plane {
  constructor() {
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.resources = this.experience.resources;

    // Options
    this.options = {};

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Plane");
    }

    // Setup
    this.resource = this.resources.items.planeModel;

    this.setModel();
    this.setAnimation();
  }

  setModel() {
    this.model = this.resource.scene;

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.name === "Cylinder_1") {
          this.yellowMaterial = child.material;
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    if (this.debug.active) {
      this.options.yellowMaterial = this.yellowMaterial.color;
      this.debugFolder
        .addColor(this.yellowMaterial, "color")
        .onChange(() => {
          this.yellowMaterial.color = this.options.yellowMaterial;
        })
        .name("Yellow Material");
    }
    this.scene.add(this.model);
  }

  setAnimation() {
    this.animation = {};
    this.animation.mixer = new THREE.AnimationMixer(this.model);

    const planeAction = this.animation.mixer.clipAction(
      this.resource.animations[0]
    );
    const propellerAction = this.animation.mixer.clipAction(
      this.resource.animations[1]
    );

    planeAction.play();
    propellerAction.play();
  }

  update() {
    // Airplane animation
    this.animation.mixer.update(this.time.delta * 0.001);
  }
}
