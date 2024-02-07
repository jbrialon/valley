import * as THREE from "three";

import { gsap } from "gsap";
import Experience from "../Experience";

import { findMaxConsecutive } from "../Utils/utils.js";
import { markers, markersArray } from "../Data/markers.js";

export default class Markers {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.debug = this.experience.debug;
    this.time = this.experience.time;
    this.inputEvents = this.experience.inputEvents;
    this.manager = this.experience.manager;
    this.resources = this.experience.resources;
    this.helpers = this.experience.helpers;

    // Options
    this.options = {
      range: 45,
      markerCloseTimer: 400,
      defaultColor: new THREE.Color(0x992625),
      secondaryColor: new THREE.Color(0x2c4d38),
      mountainColor: new THREE.Color(0x5a5444),
    };

    // Setup
    this.currentChapter = this.manager.getCurrentChapter();
    this.point = new THREE.Vector3();
    this.markers = [];
    this.revealedSteps = [];
    this.setMaterial();
    this.setMarkers();
    this.initEvents();

    // Debug
    this.setDebug();
  }

  setMaterial() {
    this.gradientMap = this.resources.items.threeToneToonTexture;
    this.gradientMap.magFilter = THREE.NearestFilter;

    this.material = new THREE.MeshToonMaterial({
      color: this.options.defaultColor,
      gradientMap: this.gradientMap,
    });

    this.secondaryMaterial = new THREE.MeshToonMaterial({
      color: this.options.secondaryColor,
      gradientMap: this.gradientMap,
    });

    this.mountainMaterial = new THREE.MeshToonMaterial({
      color: this.options.mountainColor,
      gradientMap: this.gradientMap,
    });
  }

  setMarkers() {
    markersArray.forEach((marker) => {
      let material = this.material.clone();
      let geometry = new THREE.OctahedronGeometry(1, 0);
      let scale = new THREE.Vector3(0.075, 0.1, 0.075);
      let rotation = new THREE.Vector3(0, 0, 0);

      if (marker.type === "secondary") {
        geometry = new THREE.ConeGeometry(1, 2, 4, 1);
        scale = new THREE.Vector3(0.05, 0.05, 0.05);
        material = this.secondaryMaterial;
        rotation = new THREE.Vector3(0, 0, Math.PI);
      }

      if (marker.type === "mountain") {
        geometry = new THREE.ConeGeometry(1, 2, 6, 1);
        material = this.mountainMaterial;
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
      markerMesh.visible = false;
      markerMesh.scale.set(scale.x, scale.y, scale.z);
      markerMesh.rotation.set(rotation.x, rotation.y, rotation.z);

      this.markers.push(markerMesh);
      this.scene.add(markerMesh);
    });
  }

  getMarkerByName(name) {
    return markers[this.currentChapter].find((item) => item.name === name);
  }

  bounce() {
    const bounceStrength = 0.05;

    gsap.to(this.activeMarker.mesh.position, {
      y: "+=" + bounceStrength,
      duration: 0.75,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(this.activeMarker.mesh.position, {
          y: "-=" + bounceStrength,
          duration: 0.5,
          ease: "bounce.out",
        });
      },
    });
  }

  showClosestMarkers() {
    let markerCloseTimer = null;
    markersArray.forEach((marker, index) => {
      const distance = marker.position.distanceTo(this.point) * 100;
      const name = marker.name;
      if (distance <= this.options.range) {
        if (!markerCloseTimer) {
          // Start the timer if it's not already running
          markerCloseTimer = setTimeout(() => {
            // Trigger revealMarker after 400ms
            this.manageReveals(index, name);
            this.manageSteps(name);
            markerCloseTimer = null; // Reset the timer
          }, this.options.markerCloseTimer);
        } else {
          // Reset the timer if the distance exceeds 45 units
          clearTimeout(markerCloseTimer);
          markerCloseTimer = null;
        }
      }
      // if (distance > 20 && distance <= 90) {
      //   const markerMesh = this.markers[index];
      //   const posY = THREE.MathUtils.mapLinear(
      //     distance,
      //     20,
      //     90,
      //     marker.position.y,
      //     marker.position.y - 1
      //   );
      //   markerMesh.visible = true;
      //   markerMesh.position.y = posY;
      // } else if (distance <= 20) {
      // this.revealMarker(index);
      // }
    });
  }

  manageReveals(index, name) {
    const markerMesh = this.markers[index];
    const marker = this.getMarkerByName(name);
    if (!markerMesh.visible) {
      // Reveal Overlay only if in current chapter
      if (marker) {
        this.manager.trigger("revealOverlay", index, name);
      }
      // Reveal Marker
      markerMesh.visible = true;
      markerMesh.position.y = markersArray[index].position.y - 1;
      gsap.to(markerMesh.position, {
        y: markersArray[index].position.y,
        duration: 1.5,
        ease: "power4.inOut",
        onComplete: () => {
          if (index === 0) {
            this.manager.trigger("revealProps", index);
          }
        },
      });
    }
  }

  manageSteps(name) {
    const marker = this.getMarkerByName(name);

    if (marker && !this.revealedSteps.includes(marker.order)) {
      this.revealedSteps.push(marker.order);
      if (this.revealedSteps.length > 1) {
        const previousSteps = markers[this.currentChapter].filter(
          (item) => item.order < marker.order
        );
        const allPreviousStepsRevealed = previousSteps.every((item) =>
          this.revealedSteps.includes(item.order)
        );

        if (allPreviousStepsRevealed) {
          const currentStep = findMaxConsecutive(this.revealedSteps) - 1;
          this.showPath(currentStep, name);
          console.log(
            `All previous steps for ${name} are revealed. Showing path to ${currentStep}.`
          );
        } else {
          console.log(`All previous steps for ${name} are not revealed.`);
        }
        if (this.revealedSteps.length === markers[this.currentChapter].length) {
          console.log(
            `All steps from ${this.currentChapter} are revealed, go to next chapter.`
          );
          // we should wait for all animations to be hover actually
          this.manager.goToNextChapter();
        }
      }
    } else if (!marker) {
      console.log(`Marker not found, probably not in the current chapter.`);
    }
  }

  showPath(index, name) {
    this.manager.trigger("showDashLine", index, name);
  }

  initEvents() {
    this.manager.on("navigation", (point) => {
      this.point = point;
    });

    this.manager.on("updateColors", (colors) => {
      this.options.defaultColor = colors[4];
      this.options.secondaryColor = colors[2];
      this.options.mountainColor = colors[2];

      this.markers
        .filter((marker) => marker.type === "main")
        .forEach((marker) => {
          marker.material.color = new THREE.Color(this.options.defaultColor);
        });
      this.markers
        .filter((marker) => marker.type === "secondary" || "mountain")
        .forEach((marker) => {
          marker.material.color = new THREE.Color(this.options.secondaryColor);
        });
      this.debugFolder.controllers.forEach((controller) => {
        controller.updateDisplay();
      });
    });
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Markers");
      this.debugFolder.close();

      this.debugFolder
        .add(this.options, "range")
        .name("Detection Range")
        .min(0)
        .max(100)
        .step(0.01);
      this.debugFolder
        .add(this.options, "markerCloseTimer")
        .name("Detection Time")
        .min(0)
        .max(1000)
        .step(0.01);
      this.debugFolder
        .addColor(this.options, "defaultColor")
        .name("Main Color")
        .onChange(() => {
          this.markers
            .filter((marker) => marker.type === "main")
            .forEach((marker) => {
              marker.material.color = new THREE.Color(
                this.options.defaultColor
              );
            });
        });
      this.debugFolder
        .addColor(this.options, "secondaryColor")
        .name("Secondary Color")
        .onChange(() => {
          this.markers
            .filter((marker) => marker.type === "secondary")
            .forEach((marker) => {
              marker.material.color = new THREE.Color(
                this.options.secondaryColor
              );
            });
        });
      this.debugFolder
        .addColor(this.options, "mountainColor")
        .name("Mountain Color")
        .onChange(() => {
          this.markers
            .filter((marker) => marker.type === "mountain")
            .forEach((marker) => {
              marker.material.color = new THREE.Color(
                this.options.mountainColor
              );
            });
        });
    }
  }

  update() {
    if (this.inputEvents.isPressed && this.point) {
      this.showClosestMarkers();
    }

    this.markers.forEach((marker) => {
      const rotationSpeed = Math.random() * 0.005;
      if (marker.visible) {
        marker.rotation.y += rotationSpeed * this.time.delta;
      }
    });
  }
}
