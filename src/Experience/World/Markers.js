import * as THREE from "three";
import { gsap } from "gsap";
import Experience from "../Experience";

import markers from "../Data/markers.js";

import toonMaterial from "../Materials/ToonMaterial.js";

export default class Markers {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;
    this.debug = this.experience.debug;
    this.time = this.experience.time;
    this.manager = this.experience.Manager;
    this.resources = this.experience.resources;

    // Options
    this.options = {
      color: 0x992625,
    };

    // Setup
    this.markers = [];
    this.setMaterial();
    this.setMarkers();

    // Debug
    this.setDebug();
  }

  setMaterial() {
    this.gradientMap = this.resources.items.threeToneToonTexture;
    this.gradientMap.magFilter = THREE.NearestFilter;

    this.material = toonMaterial({
      color: this.options.color,
      gradientMap: this.gradientMap,
    });
  }

  setMarkers() {
    markers.forEach((marker) => {
      const material = this.material.clone();
      let geometry = new THREE.OctahedronGeometry(1, 0);
      let scale = new THREE.Vector3(0.075, 0.1, 0.075);
      let rotation = new THREE.Vector3(0, 0, 0);

      if (marker.type === "restaurant") {
        geometry = new THREE.ConeGeometry(1, 2, 4, 1);
        material.color.set("#599fd3");
        scale = new THREE.Vector3(0.05, 0.05, 0.05);
        rotation = new THREE.Vector3(0, 0, Math.PI);
      }

      if (marker.type === "mountain") {
        geometry = new THREE.ConeGeometry(1, 2, 6, 1);
        material.color.set("#442a19");
        scale = new THREE.Vector3(0.075, 0.05, 0.075);
        rotation = new THREE.Vector3(0, 0, 0);
      }

      const markerMesh = new THREE.Mesh(geometry, material);
      markerMesh.name = marker.name;
      markerMesh.type = marker.type;
      markerMesh.position.set(
        marker.position.x,
        marker.position.y,
        marker.position.z
      );
      markerMesh.scale.set(scale.x, scale.y, scale.z);
      markerMesh.rotation.set(rotation.x, rotation.y, rotation.z);

      this.markers.push(markerMesh);
      this.scene.add(markerMesh);

      this.manager.addClickEventToMesh(
        markerMesh,
        this.onMarkerClick.bind(this)
      );

      this.manager.addHoverEventToMesh(
        markerMesh,
        this.onMarkerHover.bind(this),
        this.onMarkerOut.bind(this)
      );
    });
  }

  onMarkerClick(event) {
    const marker = event.target;
    const name = marker.name;
    this.bounce(marker);
    this.manager.trigger("onMarkerClick", name);
  }

  onMarkerHover(event) {
    const marker = event.target;
    const name = marker.name;
    this.manager.trigger("onMarkerHover", name);
  }

  onMarkerOut(event) {
    const marker = event.target;
    const name = marker.name;
    this.manager.trigger("onMarkerOut", name);
  }

  bounce(marker) {
    const bounceStrength = 0.05;

    gsap.to(marker.position, {
      y: `+=${bounceStrength}`,
      duration: 0.75,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(marker.position, {
          y: "-=" + bounceStrength,
          duration: 0.5,
          ease: "bounce.out",
        });
      },
    });
  }
  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Markers");
      this.debugFolder.close();

      this.debugFolder
        .addColor(this.options, "color")
        .name("Marker Color")
        .onChange(() => {
          this.material.color.set(this.options.color);
          this.markers.forEach((marker) => {
            marker.material.color = new THREE.Color(this.options.color);
          });
        });
    }
  }

  update() {
    this.markers.forEach((marker) => {
      marker.rotation.y += 0.0015 * this.time.delta;
    });
  }
}
