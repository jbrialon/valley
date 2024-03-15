import * as THREE from "three";

import { gsap } from "gsap";
import Experience from "../Experience";

import { markers, markersArray } from "../Data/markers.js";

export default class Markers {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.debug = this.experience.debug;
    this.time = this.experience.time;
    this.sizes = this.experience.sizes;
    this.camera = this.experience.camera;
    this.inputEvents = this.experience.inputEvents;
    this.manager = this.experience.manager;
    this.resources = this.experience.resources;
    this.helpers = this.experience.helpers;

    // Options
    this.options = {
      range: 45,
      markerCloseTimer: 800,
      defaultColor: new THREE.Color(0x992625),
      secondaryColor: new THREE.Color(0x2c4d38),
      mountainColor: new THREE.Color(0x5a5444),
      scale: {
        main: new THREE.Vector3(0.075, 0.1, 0.075),
        secondary: new THREE.Vector3(0.05, 0.05, 0.05),
        mountain: new THREE.Vector3(0.075, 0.05, 0.075),
        poi: new THREE.Vector3(0.075, 0.1, 0.075),
      },
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
    markersArray.forEach((marker, index) => {
      let material = this.material.clone();
      let geometry = new THREE.OctahedronGeometry(1, 0);
      let rotation = new THREE.Vector3(0, 0, 0);
      const scale = this.options.scale[marker.type];

      if (marker.type === "secondary") {
        geometry = new THREE.ConeGeometry(1, 2, 4, 1);
        material = this.secondaryMaterial;
        rotation = new THREE.Vector3(0, 0, Math.PI);
      }

      if (marker.type === "mountain") {
        geometry = new THREE.ConeGeometry(1, 2, 6, 1);
        material = this.mountainMaterial;
        rotation = new THREE.Vector3(0, 0, 0);
      }

      const markerMesh = new THREE.Mesh(geometry, material);
      markerMesh.index = index;
      markerMesh.name = marker.name;
      markerMesh.type = marker.type;
      markerMesh.position.set(
        marker.position.x,
        marker.position.y,
        marker.position.z
      );
      markerMesh.visible = true;
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
      const markerMesh = this.markers[index];
      if (!markerMesh.visible) {
        const distance = marker.position.distanceTo(this.point) * 100;
        const name = marker.name;
        if (distance <= this.options.range) {
          if (!markerCloseTimer) {
            // Start the timer if it's not already running
            markerCloseTimer = setTimeout(() => {
              // Trigger revealMarker after 800ms
              this.manageReveals(index, name);
              this.manager.addToRevealedSteps(name);
              clearTimeout(markerCloseTimer);
              markerCloseTimer = null; // Reset the timer
            }, this.options.markerCloseTimer);
          } else {
            // Reset the timer if the distance exceeds 45 units
            clearTimeout(markerCloseTimer);
            markerCloseTimer = null;
          }
        }
      }
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
      markerMesh.position.y = markersArray[index].position.y - 0.5;
      const scale = this.options.scale[markerMesh.type];
      markerMesh.scale.set(scale.x, scale.y, scale.z);

      gsap.to(markerMesh.position, {
        y: markersArray[index].position.y,
        duration: 0.5,
        ease: "power4.inOut",
        onStart: () => {
          this.manager.trigger("log-update-count");
        },
        onComplete: () => {
          // when marker is revealed we add the events
          this.manager.addHoverEventToMesh(markerMesh, () => {
            this.manager.showInfowindow(markerMesh);
          });

          // this.manager.addClickEventToMesh(markerMesh, () => {
          //   this.manager.zoomOutOfMarker(markerMesh);
          // });
          if (index === 0) {
            this.manager.trigger("revealProps", index, name);
          }
        },
      });
    }
  }

  introAnimation() {
    this.markers.forEach((markerMesh) => {
      markerMesh.visible = true;
      const index = markerMesh.index;
      const tl = gsap.timeline({
        delay: index * 0.1,
        onComplete: () => {
          markerMesh.visible = false;
        },
      });
      tl.to(
        markerMesh.position,
        {
          y: markersArray[index].position.y + 0.5,
          duration: 1.5,
          ease: "power2.inOut",
        },
        "disappear"
      );
      tl.to(
        markerMesh.scale,
        {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.5,
          ease: "power2.inOut",
        },
        "disappear"
      );
    });
  }

  initEvents() {
    this.manager.on("navigation", (point) => {
      this.point = point;
    });

    this.manager.on("markers-intro-animation", this.introAnimation.bind(this));

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
    if (
      this.inputEvents.isPressed &&
      this.point &&
      this.manager.isSearchingEnabled()
    ) {
      this.showClosestMarkers();
    }

    if (this.manager.getActiveMarker()) {
      const screenPosition = this.manager.getActiveMarker().position.clone();
      screenPosition.project(this.camera.instance);

      const position = new THREE.Vector3(
        screenPosition.x * this.sizes.width * 0.5,
        -screenPosition.y * this.sizes.height * 0.5
      );
      this.manager.trigger("infowindow-update-position", position);
    }

    this.markers.forEach((marker) => {
      const rotationSpeed = Math.random() * 0.005;
      if (marker.visible) {
        marker.rotation.y += rotationSpeed * this.time.delta;
      }
    });
  }
}
