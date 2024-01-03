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
    this.manager = this.experience.manager;
    this.camera = this.experience.camera;
    this.resources = this.experience.resources;

    // Options
    this.options = {
      range: 4.5,
      defaultColor: "#992625",
      mountainColor: "#442a19",
      secondaryColor: "#599fd3",
    };

    // Setup
    this.markers = [];
    this.setMaterial();
    this.setMarkers();
    this.initEvents();

    // Debug
    this.setDebug();
  }

  setMaterial() {
    this.gradientMap = this.resources.items.threeToneToonTexture;
    this.gradientMap.magFilter = THREE.NearestFilter;

    this.material = toonMaterial({
      color: this.options.defaultColor,
      gradientMap: this.gradientMap,
      transparent: true,
      opacity: 0,
    });

    this.secondaryMaterial = toonMaterial({
      color: this.options.secondaryColor,
      gradientMap: this.gradientMap,
      transparent: true,
      opacity: 0,
    });

    this.mountainMaterial = toonMaterial({
      color: this.options.mountainColor,
      gradientMap: this.gradientMap,
      transparent: true,
      opacity: 0,
    });
  }

  setMarkers() {
    markers.forEach((marker) => {
      let material = this.material.clone();
      let geometry = new THREE.OctahedronGeometry(1, 0);
      let scale = new THREE.Vector3(0.075, 0.1, 0.075);
      let rotation = new THREE.Vector3(0, 0, 0);

      if (marker.type === "secondary") {
        geometry = new THREE.ConeGeometry(1, 2, 4, 1);
        scale = new THREE.Vector3(0.05, 0.05, 0.05);
        material = this.secondaryMaterial.clone();
        rotation = new THREE.Vector3(0, 0, Math.PI);
      }

      if (marker.type === "mountain") {
        geometry = new THREE.ConeGeometry(1, 2, 6, 1);
        material = this.mountainMaterial.clone();
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
      y: "+=" + bounceStrength,
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

  initEvents() {
    this.manager.on("loaded", () => {
      this.markers.forEach((marker) => {
        if (this.isMarkerInRange(marker)) {
          this.showMarkerInRange(marker);
        }
      });
    });

    this.manager.on("onScrollComplete", () => {
      this.markers.forEach((marker) => {
        if (this.isMarkerInRange(marker)) {
          this.showMarkerInRange(marker);
        }
      });
    });
  }

  isMarkerInRange(marker) {
    const distance = marker.position.distanceTo(
      this.camera.cameraParent.position
    );

    return distance < this.options.range;
  }

  showMarkerInRange(marker) {
    if (!marker.visible) {
      marker.visible = true;

      gsap.fromTo(
        marker.material,
        {
          opacity: 0,
        },
        {
          duration: 2,
          opacity: 1,
          ease: "power4.inOut",
        }
      );
      gsap.fromTo(
        marker.position,
        { y: marker.position.y + 0.15 },
        {
          duration: 2,
          y: marker.position.y,
          ease: "power4.inOut",
        }
      );
    }
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Markers");
      this.debugFolder.close();

      this.debugFolder
        .addColor(this.options, "defaultColor")
        .name("Main Color")
        .onChange(() => {
          // this.material.color.set(this.options.defaultColor);
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
          // this.material.color.set(this.options.secondaryColor);
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
          // this.material.color.set(this.options.mountainColor);
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
    this.markers.forEach((marker) => {
      const rotationSpeed = Math.random() * 0.005;

      if (marker.visible) {
        marker.rotation.y += rotationSpeed * this.time.delta;
      }
    });
  }
}
