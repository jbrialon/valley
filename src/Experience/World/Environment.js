import * as THREE from "three";
import Experience from "../Experience";

export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;

    this.options = {
      sunlightPosition: new THREE.Vector3(-1, 3, -1),
    };
    // Setup
    this.setAmbientLight();
    this.setSunLight();

    // Debug
    this.setDebug();
  }

  setAmbientLight() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(this.ambientLight);
  }

  setSunLight() {
    this.sunLight = new THREE.DirectionalLight(0xffffff, 2);
    this.sunLight.position.set(
      this.options.sunlightPosition.x,
      this.options.sunlightPosition.y,
      this.options.sunlightPosition.z
    );

    this.scene.add(this.sunLight);
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Environment");
      this.debugFolder.close();

      this.helper = new THREE.DirectionalLightHelper(this.sunLight, 5);
      this.scene.add(this.helper);

      this.debugFolder
        .add(this.sunLight, "intensity")
        .name("sunLightIntensity")
        .min(0)
        .max(10)
        .step(0.001);

      this.debugFolder
        .add(this.ambientLight, "intensity")
        .name("ambientLightIntensity")
        .min(0)
        .max(5)
        .step(0.001);

      this.debugFolder.add(this.options.sunlightPosition, "x").onChange(() => {
        this.sunLight.position.x = this.options.sunlightPosition.x;
      });

      this.debugFolder.add(this.options.sunlightPosition, "y").onChange(() => {
        this.sunLight.position.y = this.options.sunlightPosition.y;
      });

      this.debugFolder.add(this.options.sunlightPosition, "z").onChange(() => {
        this.sunLight.position.z = this.options.sunlightPosition.z;
      });
    }
  }

  update() {}
}
