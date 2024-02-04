import * as THREE from "three";
import { gsap } from "gsap";
import Experience from "../Experience.js";

import props from "../Data/props.js";
import toonMaterial from "../Materials/ToonMaterial.js";

export default class Props {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.manager = this.experience.manager;
    this.debug = this.experience.debug;
    this.helpers = this.experience.helpers;

    // Options
    this.options = {
      uLightDirection: new THREE.Vector3(1, 3, 3),
    };

    // Setup
    this.propsMeshes = [];
    this.setMaterial();
    this.setModels();
    this.initEvents();
    // Debug
    this.setDebug();
  }

  setMaterial() {
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
  }

  setModels() {
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
        if (child.name === "rockB") {
          child.material = this.rockMaterial;
        }
      }
    });

    const models = {
      tree: this.tree,
      rock: this.rock,
    };

    props.forEach((props) => {
      props.objects.forEach((object) => {
        const mesh = models[object.type].clone();
        mesh.name = props.name;
        mesh.visible = false;
        mesh.scale.set(0, 0, 0);
        mesh.position.set(
          object.position.x,
          object.position.y,
          object.position.z
        );

        this.propsMeshes.push(mesh);
        this.scene.add(mesh);

        this.manager.addClickEventToMesh(mesh, () => {
          this.helpers.setActiveMesh(mesh);
        });
      });
    });
  }

  initEvents() {
    // expecting name as parameter
    this.manager.on("revealMeshes", this.revealMeshes.bind(this));
  }

  getMarkerByName(name) {
    return markers[this.currentChapter].find((item) => item.name === name);
  }

  revealMeshes(name) {
    setTimeout(() => {
      this.propsMeshes.forEach((mesh, index) => {
        if (mesh.name === name) {
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
        }
      });
    }, 1300);
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Meshes");
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
    }
  }

  update() {}
}
