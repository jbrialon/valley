import * as THREE from "three";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { gsap } from "gsap";

import Experience from "../Experience";

export default class DashLine {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;
    this.debug = this.experience.debug;
    this.time = this.experience.time;
    this.inputEvents = this.experience.inputEvents;
    this.manager = this.experience.manager;
    this.resources = this.experience.resources;

    // Options
    this.options = {
      // Line
      lineWidth: 18,
      dashArray: 0.03,
      dashRatio: 0.5,
      dashOffset: 0,
      visibility: 0,
      progress: [0.385, 0.582, 1],
    };

    // Setup
    this.point = new THREE.Vector3();
    this.setMaterial();
    this.setDashLine();
    this.initEvents();

    // Debug
    this.setDebug();
  }

  setMaterial() {
    this.material = new MeshLineMaterial({
      color: new THREE.Color(0xffffff),
      lineWidth: this.options.lineWidth,
      resolution: new THREE.Vector2(this.sizes.width, this.sizes.height),
      dashArray: this.options.dashArray,
      dashRatio: this.options.dashRatio,
      dashOffset: this.options.dashOffset,
      visibility: this.options.visibility,
      sizeAttenuation: false,
      depthTest: true,
      transparent: true,
    });
  }

  setDashLine() {
    this.geometry = new MeshLineGeometry();
    const points = [
      new THREE.Vector3(-4.29, 1.56, -9.07),
      new THREE.Vector3(-3.3, 2, -7.78),
      new THREE.Vector3(0.08, 1.88, -7.69),
      new THREE.Vector3(2.17, 2.34, -7.96),
      new THREE.Vector3(4.87, 2.67, -8.23),
      new THREE.Vector3(5.7, 2.65, -8.74),
    ];
    const curve = new THREE.CatmullRomCurve3(points).getPoints(50);

    this.geometry.setPoints(curve);

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  showPath(index) {
    console.log("showDashLine: ", index);
    const progress = this.options.progress[index - 1];

    gsap.to(this.material.uniforms.visibility, {
      value: progress,
      duration: 3,
      ease: "power4.inOut",
    });
  }

  initEvents() {
    this.manager.on("showDashLine", (index) => {
      this.showPath(index);
    });
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Dash Line");
      this.debugFolder
        .add(this.options, "lineWidth")
        .name("Line Width")
        .min(0)
        .max(30)
        .step(0.001)
        .onChange(() => {
          this.material.uniforms.lineWidth.value = this.options.lineWidth;
        });
      this.debugFolder
        .add(this.options, "dashArray")
        .name("Dash Array")
        .min(0)
        .max(1)
        .step(0.001)
        .onChange(() => {
          this.material.uniforms.dashArray.value = this.options.dashArray;
        });
      this.debugFolder
        .add(this.options, "dashRatio")
        .name("Dash Ratio")
        .min(-0)
        .max(1)
        .step(0.001)
        .onChange(() => {
          this.material.uniforms.dashRatio.value = this.options.dashRatio;
        });
      this.debugFolder
        .add(this.options, "dashOffset")
        .name("Dash Offset")
        .min(-20)
        .max(20)
        .onChange(() => {
          this.material.uniforms.dashOffset.value = this.options.visibility;
        });
      this.debugFolder
        .add(this.options, "visibility")
        .name("Visibility")
        .min(0)
        .max(1)
        .onChange(() => {
          this.material.uniforms.visibility.value = this.options.visibility;
        });
    }
  }

  update() {}
}
