import * as THREE from "three";
import Experience from "../Experience";

import markers from "../Data/markers.js";

import toonMaterial from "../Materials/ToonMaterial.js";

export default class Markers {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
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

  setMarkers() {
    this.geometry = new THREE.OctahedronGeometry(1, 0);

    markers.forEach((marker) => {
      const markerMesh = new THREE.Mesh(this.geometry, this.material);
      markerMesh.name = marker.name;
      markerMesh.scale.set(0.075, 0.1, 0.075);
      markerMesh.position.set(
        marker.position.x,
        marker.position.y,
        marker.position.z
      );

      this.markers.push(markerMesh);
      this.scene.add(markerMesh);

      this.manager.addClickEventToMesh(
        markerMesh,
        this.onMarkerClick.bind(this)
      );
    });
  }

  setMaterial() {
    this.gradientMap = this.resources.items.threeToneToonTexture;
    this.gradientMap.magFilter = THREE.NearestFilter;

    this.material = toonMaterial({
      color: this.options.color,
      gradientMap: this.gradientMap,
    });
  }

  onMarkerClick(event) {
    const marker = event.target;
    console.log(marker.position);
    const name = marker.name;
    this.manager.trigger("onMarkerClick", name);
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
