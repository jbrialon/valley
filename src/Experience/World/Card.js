import * as THREE from "three";
import { gsap } from "gsap";
import Experience from "../Experience";

import cardMaterial from "../Materials/CardMaterial";

import markers from "../Data/markers.js";

export default class Card {
  constructor() {
    this.experience = new Experience();
    this.manager = this.experience.manager;
    this.time = this.experience.time;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.debug = this.experience.debug;

    // Setup
    this.setMaterial();
    this.setMesh();
    this.initEvents();

    // Debug
    // this.setDebug();
  }

  setMaterial() {
    this.material = cardMaterial({
      uAlpha: {
        value: 0,
      },
      uTime: {
        value: 0,
      },
    });
  }

  setMesh() {
    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.card = new THREE.Mesh(this.geometry, this.material);

    this.card.scale.set(0.5, 0.5, 0.5);
    this.card.visible = false;
    this.scene.add(this.card);
  }

  initEvents() {
    this.manager.on("onMarkerHover", (name) => {
      const marker = this.getMarkerByName(name);
      this.card.position.set(
        marker.position.x,
        marker.position.y + 0.4,
        marker.position.z
      );
      gsap.to(this.material.uniforms.uAlpha, {
        value: 0.8,
        duration: 1.5,
        ease: "power4.inOut",
      });

      this.card.visible = true;
      this.card.lookAt(this.camera.cameraParent.position);
    });

    this.manager.on("onMarkerOut", (name) => {
      gsap.to(this.material.uniforms.uAlpha, {
        value: 0,
        duration: 1.5,
        ease: "power4.inOut",
      });
    });
  }

  getMarkerByName(name) {
    return markers.find((marker) => marker.name === name);
  }

  setDebug() {}

  update() {
    this.material.uniforms.uTime.value = this.time.elapsedTime * 0.15;
  }
}
