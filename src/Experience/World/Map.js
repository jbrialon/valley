import * as THREE from "three";
import { gsap } from "gsap";
import Experience from "../Experience";

import terrainMaterial from "../Materials/TerrainMaterial";
import toonMaterial from "../Materials/ToonMaterial.js";

export default class Map {
  constructor() {
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;
    this.time = this.experience.time;
    this.manager = this.experience.Manager;
    this.resources = this.experience.resources;
    this.inputEvents = this.experience.inputEvents;

    // Options
    this.options = {
      uAlpha: 1,
      uStrength: 0.5,
      uContourFrequency: 1,
      uLineColor: "#f4e2d6", // #74675e
      uColorOne: "#697f73", // #6a5e52
      uColorTwo: "#eda17f",
      uColorThree: "#e45221",
      uColorNumber: 1,
      uContourFrequency: 2.7,
      markerColor: 0x992625,
    };

    this.manager.on("cameraPositionChanged", () => {
      gsap.fromTo(
        this.terrainMaterial.uniforms.uContourFrequency,
        {
          value: 1,
        },
        {
          duration: 3,
          value: 3.3,
          ease: "power4.inOut",
        }
      );
    });

    // Setup
    this.resource = this.resources.items.mapModel;
    this.gradientMap = this.resources.items.threeToneToonTexture;
    this.gradientMap.magFilter = THREE.NearestFilter;

    this.terrainMaterial = terrainMaterial({
      uAlpha: 1,
      uStrength: 1,
      uPixelRatio: this.sizes.pixelRatio,
      uContourWidth: 1,
      uColorNumber: this.options.uColorNumber,
      uContourFrequency: this.options.uContourFrequency,
      uTerrainColor: this.options.uTerrainColor,
      uLineColor: this.options.uLineColor,
      uColorOne: this.options.uColorOne,
      uColorTwo: this.options.uColorTwo,
      uColorThree: this.options.uColorThree,
      uMaskTexture: null,
    });

    this.markerMaterial = toonMaterial({
      color: 0x992625,
      gradientMap: this.gradientMap,
    });
    this.markers = [];
    this.lakeMaterial = new THREE.MeshBasicMaterial({ color: 0x6bae8d });
    this.setModel();

    // Debug
    this.setDebug();
  }

  setModel() {
    this.model = this.resource.scene.clone();

    this.model.traverse((child) => {
      // TODO : should not all be in the same models
      if (child instanceof THREE.Mesh && child.name === "map") {
        child.material = this.terrainMaterial;
      } else if (child instanceof THREE.Mesh && child.name.includes("Lake")) {
        child.material = this.lakeMaterial;
      } else if (
        child instanceof THREE.Mesh &&
        child.name !== "Scene" &&
        child !== undefined
      ) {
        child.visible = false;
        this.addMarkerToPosition(child);
      } else if (child instanceof THREE.PerspectiveCamera) {
        // Camera position
      }
    });

    this.scene.add(this.model);
  }

  addMarkerToPosition(marker) {
    const geometry = new THREE.OctahedronGeometry(1, 0);
    const material = this.markerMaterial.clone();
    const markerMesh = new THREE.Mesh(geometry, material);
    markerMesh.name = marker.name;
    markerMesh.scale.set(0.075, 0.1, 0.075);
    markerMesh.position.set(
      marker.position.x,
      marker.position.y,
      marker.position.z
    );
    this.markers.push(markerMesh);
    this.scene.add(markerMesh);
    this.manager.addClickEventToMesh(markerMesh, this.onMarkerClick.bind(this));
  }

  onMarkerClick(event) {
    const marker = event.target;
    const name = marker.name;
    this.manager.trigger("onMarkerClick", name);
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Map");
      this.debugFolder.close();

      this.debugFolderMarker = this.debugFolder.addFolder("Marker");
      this.debugFolderMarker
        .addColor(this.options, "markerColor")
        .name("Marker Color")
        .onChange(() => {
          this.markerMaterial.color.set(this.options.markerColor);
          this.markers.forEach((marker) => {
            marker.material.color = new THREE.Color(this.options.markerColor);
          });
        });
      this.debugFolderMap = this.debugFolder.addFolder("Map");
      this.debugFolderMap
        .add(this.terrainMaterial.uniforms.uAlpha, "value")
        .min(0)
        .max(1)
        .step(0.01)
        .name("Alpha");
      this.debugFolderMap
        .add(this.terrainMaterial.uniforms.uContourWidth, "value")
        .min(0)
        .max(3)
        .step(0.001)
        .name("Contour Width");
      this.debugFolderMap
        .add(this.terrainMaterial.uniforms.uContourFrequency, "value")
        .min(0.1)
        .max(20)
        .step(0.1)
        .name("Contour Frequency");
      this.debugFolderMap
        .addColor(this.options, "uColorOne")
        .name("Color One")
        .onChange(() => {
          this.terrainMaterial.uniforms.uColorOne.value.set(
            this.options.uColorOne
          );
        });
      this.debugFolderMap
        .addColor(this.options, "uLineColor")
        .name("Line Color")
        .onChange(() => {
          this.terrainMaterial.uniforms.uLineColor.value.set(
            this.options.uLineColor
          );
        });
    }
  }

  update() {
    this.markers.forEach((marker) => {
      marker.rotation.y += 0.0015 * this.time.delta;
    });
  }
}
