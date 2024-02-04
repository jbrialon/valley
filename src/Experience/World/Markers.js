import * as THREE from "three";

import { gsap } from "gsap";
import Experience from "../Experience";

import markers from "../Data/markers.js";

import toonMaterial from "../Materials/ToonMaterial.js";

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
    this.camera = this.experience.camera;

    // Options
    this.options = {
      range: 45,
      markerCloseTimer: 400,
      defaultColor: new THREE.Color(0x992625),
      secondaryColor: new THREE.Color(0x2c4d38),
      mountainColor: new THREE.Color(0x5a5444),
      // Line
      lineWidth: 18,
      dashArray: 0.05,
      dashRatio: 0.5,
      dashOffset: 0,
      visibility: 0,
      // Meshes
      uLightDirection: new THREE.Vector3(1, 3, 3),
    };

    // Setup
    this.point = new THREE.Vector3();
    this.markers = [];
    this.revealedSteps = [];
    this.setMaterial();
    this.setMarkers();
    this.initEvents();
    this.addMeshes();

    // Debug
    this.setDebug();
  }

  setMaterial() {
    this.gradientMap = this.resources.items.threeToneToonTexture;
    this.gradientMap.magFilter = THREE.NearestFilter;

    this.toonTexture = this.resources.items.toonTexture;

    this.foliageMaterial = toonMaterial({
      uColor: new THREE.Color(0x1e854d),
      uTexture: this.toonTexture,
      uLightDirection: this.options.uLightDirection,
    });

    this.woodMaterial = toonMaterial({
      uColor: new THREE.Color(0xa67b56),
      uTexture: this.toonTexture,
      uLightDirection: this.options.uLightDirection,
    });

    this.rockMaterial = toonMaterial({
      uColor: new THREE.Color(0xead3a2),
      uTexture: this.toonTexture,
      uLightDirection: this.options.uLightDirection,
    });

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

  addMeshes() {
    const meshPos = [
      new THREE.Vector3(-4.58, 1.44, -9.03),
      new THREE.Vector3(-4.26, 1.53, -8.82),
      new THREE.Vector3(-4.36, 1.45, -9.3),
      new THREE.Vector3(-4.13, 1.49, -9.23),
    ];

    this.treeMeshes = [];
    this.tree = this.resources.items.treeModel.scene;
    this.tree.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material.name === "foliage") {
          child.material = this.foliageMaterial;
        } else if (child.material.name === "wood") {
          child.material = this.woodMaterial;
        }
      }
    });

    this.rock = this.resources.items.rockModel.scene;

    this.rock.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        console.log(child.name);
        if (child.name === "rockB") {
          child.material = this.rockMaterial;
        }
      }
    });

    meshPos.forEach((pos) => {
      const meshes = [this.tree.clone(), this.rock.clone()];

      const mesh = meshes[Math.round(Math.random())];
      mesh.visible = false;
      mesh.scale.set(0, 0, 0);
      mesh.position.set(pos.x, pos.y, pos.z);
      this.treeMeshes.push(mesh);
      this.scene.add(mesh);
    });

    // this.manager.addClickEventToMesh(this.tree, () => {
    //   this.helpers.setActiveMesh(this.tree);
    // });
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

      setTimeout(() => {
        this.treeMeshes.forEach((mesh, index) => {
          mesh.visible = true;
          const size = 0.15 + Math.random() * 0.09;
          gsap.to(mesh.scale, {
            duration: 1.2,
            delay: index * 0.3, // Stagger the animation
            x: size,
            y: size,
            z: size,
            ease: "elastic.out",
          });
        });
      }, 1300);
    }
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
    markers.forEach((marker, index) => {
      const distance = marker.position.distanceTo(this.point) * 100;
      if (distance <= this.options.range) {
        if (!markerCloseTimer) {
          // Start the timer if it's not already running
          markerCloseTimer = setTimeout(() => {
            // Trigger revealMarker after 400ms
            this.revealMarker(index);
            this.manageSteps(index);
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

  manageSteps(index) {
    const marker = markers[index];
    if (
      !this.revealedSteps.includes(index) &&
      (marker.type === "main" || marker.type === "secondary")
    ) {
      this.revealedSteps.push(index);
      if (this.revealedSteps.length > 1) {
        const prevIndex = this.revealedSteps[this.revealedSteps.length - 2];
        if (index - prevIndex === 1) {
          this.showPath(index); // Call the corresponding path function
        }
      }
    }
  }

  showPath(index) {
    this.manager.trigger("showDashLine", index);
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

      this.debugFolder.add(this.options.uLightDirection, "x").onChange(() => {
        this.woodMaterial.uniforms.uLightDirection.x =
          this.options.uLightDirection.x;
        this.foliageMaterial.uniforms.uLightDirection.x =
          this.options.uLightDirection.x;
      });
      this.debugFolder.add(this.options.uLightDirection, "y").onChange(() => {
        this.woodMaterial.uniforms.uLightDirection.y =
          this.options.uLightDirection.y;
        this.foliageMaterial.uniforms.uLightDirection.y =
          this.options.uLightDirection.y;
      });
      this.debugFolder.add(this.options.uLightDirection, "z").onChange(() => {
        this.woodMaterial.uniforms.uLightDirection.z =
          this.options.uLightDirection.z;
        this.foliageMaterial.uniforms.uLightDirection.z =
          this.options.uLightDirection.z;
      });

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
    console.log(this.camera.cameraParent.position);
    // this.foliageMaterial.uniforms.uLightDirection.value = new THREE.Vector3(
    //   this.camera.cameraParent.position.x,
    //   this.camera.cameraParent.position.y,
    //   this.camera.cameraParent.position.z
    // );
    // this.camera.cameraParent.position.x;

    this.markers.forEach((marker) => {
      const rotationSpeed = Math.random() * 0.005;
      if (marker.visible) {
        marker.rotation.y += rotationSpeed * this.time.delta;
      }
    });
  }
}
