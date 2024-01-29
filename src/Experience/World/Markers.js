import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";

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
    this.inputEvents = this.experience.inputEvents;
    this.manager = this.experience.manager;
    this.resources = this.experience.resources;

    // Options
    this.options = {
      range: 4.5,
      defaultColor: "#992625",
      secondaryColor: "#2c4d38",
      mountainColor: "#5a5444",
    };

    // Setup
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

    this.material = toonMaterial({
      color: this.options.defaultColor,
      gradientMap: this.gradientMap,
      transparent: true,
      opacity: 1,
    });

    this.secondaryMaterial = toonMaterial({
      color: this.options.secondaryColor,
      gradientMap: this.gradientMap,
      transparent: true,
      opacity: 1,
    });

    this.mountainMaterial = toonMaterial({
      color: this.options.mountainColor,
      gradientMap: this.gradientMap,
      transparent: true,
      opacity: 1,
    });
  }

  setMarkers() {
    markers.forEach((marker, index) => {
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

  revealMarker(index) {
    const markerMesh = this.markers[index];
    if (!markerMesh.visible) {
      markerMesh.visible = true;
      markerMesh.position.y = markers[index].position.y - 1;
      gsap.to(markerMesh.position, {
        y: markers[index].position.y,
        duration: 1.5,
        ease: "power4.inOut",
      });
    }
  }

  addPathsOne() {
    const points = [
      new THREE.Vector3(-4.29, 1.56, -9.07),
      new THREE.Vector3(-3.3, 2, -7.78),
      new THREE.Vector3(0.08, 1.88, -7.69),
    ];

    const positions = [];
    const colors = [];
    const spline = new THREE.CatmullRomCurve3(points);

    const divisions = Math.round(12 * points.length);
    const point = new THREE.Vector3();
    const color = new THREE.Color();

    for (let i = 0, l = divisions; i < l; i++) {
      const t = i / l;

      spline.getPoint(t, point);
      positions.push(point.x, point.y, point.z);

      color.setHSL(t, 1.0, 0.5, THREE.SRGBColorSpace);
      colors.push(color.r, color.g, color.b);
    }

    const geometry = new LineGeometry();
    geometry.setPositions(positions);

    const matLine = new LineMaterial({
      color: 0xffffff,
      linewidth: 5,
      resolution: new THREE.Vector2(this.sizes.width, this.sizes.height),
      dashed: true,
      dashScale: 10,
      gapSize: 1,
      alphaToCoverage: true,
    });

    const line = new Line2(geometry, matLine);
    line.computeLineDistances();

    this.scene.add(line);
  }

  addPathsTwo() {
    const points = [
      new THREE.Vector3(0.08, 1.88, -7.69),
      new THREE.Vector3(2.17, 2.34, -7.96),
    ];

    const positions = [];
    const colors = [];
    const spline = new THREE.CatmullRomCurve3(points);

    const divisions = Math.round(12 * points.length);
    const point = new THREE.Vector3();
    const color = new THREE.Color();

    for (let i = 0, l = divisions; i < l; i++) {
      const t = i / l;

      spline.getPoint(t, point);
      positions.push(point.x, point.y, point.z);

      color.setHSL(t, 1.0, 0.5, THREE.SRGBColorSpace);
      colors.push(color.r, color.g, color.b);
    }

    const geometry = new LineGeometry();
    geometry.setPositions(positions);

    const matLine = new LineMaterial({
      color: 0xffffff,
      linewidth: 5,
      resolution: new THREE.Vector2(this.sizes.width, this.sizes.height),
      dashed: true,
      dashScale: 10,
      gapSize: 1,
      alphaToCoverage: true,
    });

    const line = new Line2(geometry, matLine);
    line.computeLineDistances();

    this.scene.add(line);
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
    markers.forEach((marker, index) => {
      const distance = marker.position.distanceTo(this.point) * 100;
      if (distance <= 45) {
        this.revealMarker(index);
        this.manageSteps(index);
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

  manageSteps(index) {
    this.revealedSteps.push(index);

    if (this.revealedSteps.length > 1) {
      const prevIndex = this.revealedSteps[this.revealedSteps.length - 2];
      if (index - prevIndex === 1) {
        this.showPath(index); // Call the corresponding path function
      }
    }
  }

  showPath(index) {
    if (index === 1) {
      this.addPathsOne();
    } else if (index === 2) {
      this.addPathsTwo();
    }
    // console.log(index);
    // this.addPaths();
  }

  initEvents() {
    this.manager.on("navigation", (point) => {
      this.point = point;
    });

    this.manager.on("revealMarker", (index) => {
      this.revealMarker(index);
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
        .name("range")
        .min(0)
        .max(10)
        .step(0.1);
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
