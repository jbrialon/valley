import * as THREE from "three";
import { gsap } from "gsap";
import Experience from "../Experience.js";

import props from "../Data/props.js";
import toonMaterial from "../Materials/ToonMaterial.js";

import { markersArray } from "../Data/markers.js";

export default class Props {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.manager = this.experience.manager;
    this.debug = this.experience.debug;
    this.helpers = this.experience.helpers;
    this.transformControls = this.experience.helpers.transformControls;

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
    this.toonTexture.magFilter = THREE.NearestFilter;
  }

  setModels() {
    this.tree = this.resources.items.treeModel.scene;
    this.tree.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = toonMaterial({
          uColor: child.material.color,
          uTexture: this.toonTexture,
          uLightDirection: this.options.uLightDirection,
        });
        child.material = material;
      }
    });

    this.bush = this.resources.items.bushModel.scene;
    this.bush.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = toonMaterial({
          uColor: child.material.color,
          uTexture: this.toonTexture,
          uLightDirection: this.options.uLightDirection,
        });
        child.material = material;
      }
    });

    this.rock = this.resources.items.rockModel.scene;
    this.rock.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = toonMaterial({
          uColor: child.material.color,
          uTexture: this.toonTexture,
          uLightDirection: this.options.uLightDirection,
        });
        child.material = material;
      }
    });

    this.buildingA = this.resources.items.buildingModelA.scene;
    this.buildingA.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = toonMaterial({
          uColor: child.material.color,
          uTexture: this.toonTexture,
          uLightDirection: this.options.uLightDirection,
        });
        child.material = material;
      }
    });

    this.buildingB = this.resources.items.buildingModelB.scene;
    this.buildingB.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = toonMaterial({
          uColor: child.material.color,
          uTexture: this.toonTexture,
          uLightDirection: this.options.uLightDirection,
        });
        child.material = material;
      }
    });

    this.buildingBFlags = this.resources.items.buildingModelBFlags.scene;
    this.buildingBFlags.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = toonMaterial({
          uColor: child.material.color,
          uTexture: this.toonTexture,
          uLightDirection: this.options.uLightDirection,
        });
        child.material = material;
      }
    });

    this.buildingC = this.resources.items.buildingModelC.scene;
    this.buildingC.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = toonMaterial({
          uColor: child.material.color,
          uTexture: this.toonTexture,
          uLightDirection: this.options.uLightDirection,
        });
        child.material = material;
      }
    });

    const models = {
      tree: this.tree,
      bush: this.bush,
      rock: this.rock,
      "building-a": this.buildingA,
      "building-b": this.buildingB,
      "building-b-flags": this.buildingBFlags,
      "building-c": this.buildingC,
    };

    props.forEach((props) => {
      const name = props.name;
      props.objects.forEach((object, index) => {
        const mesh = models[object.type].clone();
        mesh.name = `${props.name}.${index}`;
        mesh.type = "props";
        mesh.index = index;
        if (name !== "syabru_besi") {
          mesh.visible = false;
          mesh.scale.set(0, 0, 0);
        } else {
          mesh.scale.set(object.scale.x, object.scale.y, object.scale.z);
        }
        mesh.finalScale = object.scale;
        mesh.rotation.set(
          object.rotation.x,
          object.rotation.y,
          object.rotation.z
        );

        mesh.position.set(
          object.position.x,
          object.position.y,
          object.position.z
        );

        this.propsMeshes.push(mesh);
        this.scene.add(mesh);

        if (this.debug.active) {
          this.manager.addClickEventToMesh(mesh, () => {
            this.helpers.setActiveMesh(mesh);
          });
        }
      });
    });
  }

  initEvents() {
    // expecting index as parameter
    this.manager.on("props-reveal", this.revealProps.bind(this));
    this.manager.on("props-hide", this.hideProps.bind(this));
  }

  revealProps(index) {
    const name = markersArray[index].name;
    const meshes = this.propsMeshes.filter((mesh) => mesh.name.includes(name));
    meshes.forEach((mesh, index) => {
      console.log(mesh.visible);
      if (!mesh.visible) {
        mesh.visible = true;
        const size = mesh.finalScale;
        gsap.to(mesh.scale, {
          duration: 1.2,
          delay: index * 0.3, // Stagger the animation
          x: size.x,
          y: size.y,
          z: size.z,
          ease: "elastic.out",
          onComplete: () => {
            if (
              index === meshes.length - 1 &&
              this.manager.isLastStepOfChapter()
            ) {
              this.manager.goToNextChapter();
            }
          },
        });
      }
    });
    // Debug
    console.log("Reveal Props:", index, name);
  }

  hideProps(index) {
    const name = markersArray[index].name;
    const meshes = this.propsMeshes.filter((mesh) => mesh.name.includes(name));
    meshes.forEach((mesh, index) => {
      if (mesh.visible) {
        // mesh.visible = true;
        // const size = mesh.finalScale;
        gsap.to(mesh.scale, {
          duration: 0.5,
          delay: index * 0.1, // Stagger the animation
          x: 0,
          y: 0,
          z: 0,
          ease: "power4.out",
          onComplete: () => {
            mesh.visible = false;
          },
        });
      }
    });

    // Debug
    console.log("Hide Props:", index, name);
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Props");
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

      this.transformControls.addEventListener("dragging-changed", (event) => {
        const transformedPoint = this.transformControls.object;
        const index = transformedPoint.index;
        const type = transformedPoint.type;
        const name = transformedPoint.name;

        if (!event.value && type === "props") {
          console.log(
            `New Props Position for ${name}:`,
            index,
            `new THREE.Vector3(${transformedPoint.position.x.toFixed(
              2
            )},${transformedPoint.position.y.toFixed(
              2
            )},${transformedPoint.position.z.toFixed(2)})`
          );
          console.log(
            `New Props Scale for ${name}:`,
            index,
            `new THREE.Vector3(${transformedPoint.scale.x.toFixed(
              2
            )},${transformedPoint.scale.y.toFixed(
              2
            )},${transformedPoint.scale.z.toFixed(2)})`
          );
          console.log(
            `New Props Rotation for ${name}:`,
            index,
            `new THREE.Vector3(${transformedPoint.rotation.x.toFixed(
              2
            )},${transformedPoint.rotation.y.toFixed(
              2
            )},${transformedPoint.rotation.z.toFixed(2)})`
          );
        }
      });
    }
  }

  update() {}
}
