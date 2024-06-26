import * as THREE from "three";
import Experience from "../Experience";

import { addBarycentricCoordinates } from "../Utils/Geometry";

import terrainMaterial from "../Materials/TerrainMaterial";
import wireframeMaterial from "../Materials/WireframeMaterial";

export default class Map {
  constructor() {
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;
    this.time = this.experience.time;
    this.manager = this.experience.manager;
    this.resources = this.experience.resources;
    this.inputEvents = this.experience.inputEvents;

    // Options
    this.options = {
      // Wireframe Material
      uFill: 0x697f73,
      uStroke: 0xf4e2d6,
      uInsideAltColor: false,
      uThickness: 0.02,
      uSecondThickness: 0.05,
      uDashEnabled: true,
      uDashRepeats: 3.0,
      uDashOverlap: false,
      uDashLength: 0.55,
      uDashAnimate: false,
      uSqueeze: false,
      uSqueezeMin: 0.2,
      uSqueezeMax: 1,
      // Terrain Material
      uAlpha: 1,
      uStrength: 0.5,
      uContourFrequency: 1,
      uLineColor: 0xf4e2d6, // #74675e
      uColorOne: 0x697f73, // #6a5e52
      uColorTwo: 0xeda17f,
      uColorThree: 0xe45221,
      uColorNumber: 1,
      uContourFrequency: 2.7,
    };

    // Setup
    this.resource = this.resources.items.mapModel;
    this.terrainMaterial = terrainMaterial({
      uAlpha: 1,
      uStrength: 1,
      uPixelRatio: this.sizes.pixelRatio,
      uContourWidth: 1,
      uColorNumber: this.options.uColorNumber,
      uContourFrequency: this.options.uContourFrequency,
      uLineColor: this.options.uLineColor,
      uColorOne: this.options.uColorOne,
      uColorTwo: this.options.uColorTwo,
      uColorThree: this.options.uColorThree,
    });
    this.wireframeMaterial = wireframeMaterial({
      uFill: this.options.uFill,
      uStroke: this.options.uStroke,
      uThickness: this.options.uThickness,
      uSqueeze: this.options.uSqueeze,
      uSqueezeMin: this.options.uSqueezeMin,
      uSqueezeMax: this.options.uSqueezeMax,
      // Dash
      uDashEnabled: this.options.uDashEnabled,
      uDashRepeats: this.options.uDashRepeats,
      uDashOverlap: this.options.uDashOverlap,
      uDashLength: this.options.uDashLength,
      uDashAnimate: this.options.uDashAnimate,
    });

    this.lakeMaterial = new THREE.MeshBasicMaterial({ color: 0x6bae8d });
    this.setModel();

    // Debug
    this.setDebug();
    this.initEvents();
  }

  initEvents() {
    this.manager.on("updateColors", (colors) => {
      // Wireframe
      this.options.uFill = colors[0];
      this.wireframeMaterial.uniforms.uFill.value.set(this.options.uFill);

      this.options.uStroke = colors[1];
      this.wireframeMaterial.uniforms.uStroke.value.set(this.options.uStroke);

      // Terrain
      this.options.uColorOne = colors[0];
      this.terrainMaterial.uniforms.uColorOne.value.set(this.options.uColorOne);
      this.options.uLineColor = colors[1];

      this.terrainMaterial.uniforms.uLineColor.value.set(
        this.options.uLineColor
      );

      this.debugVisualFolder.controllers.forEach((controller) => {
        controller.updateDisplay();
      });
    });
  }

  setModel() {
    this.model = this.resource.scene.clone();

    this.mapModel = null;
    this.model.traverse((child) => {
      // TODO : should not all be in the same models
      if (child instanceof THREE.Mesh && child.name === "map") {
        child.geometry = child.geometry.toNonIndexed();
        addBarycentricCoordinates(child.geometry, true);
        child.geometry.computeBoundsTree();
        this.mapModel = child;
      } else if (child instanceof THREE.Mesh && child.name.includes("Lake")) {
        child.material = this.lakeMaterial;
      } else if (
        child instanceof THREE.Mesh &&
        child.name !== "Scene" &&
        child !== undefined
      ) {
        child.visible = false;
        // this.printMarkerData(child);
      } else if (child instanceof THREE.PerspectiveCamera) {
        // Camera position
        child.visible = false;
      }
    });
    this.mapModel.material = this.wireframeMaterial;
    this.scene.add(this.model);
  }

  printMarkerData(marker) {
    console.log(
      `{name: '${
        marker.name
      }', position: new THREE.Vector3(${marker.position.x.toFixed(
        2
      )},${marker.position.y.toFixed(2)},${marker.position.z.toFixed(2)})}`
    );
  }

  setDebug() {
    if (this.debug.active) {
      let isWireframeActive = true;

      this.debugFolder = this.debug.ui.addFolder("Map");
      this.debugFolder.close();
      this.debugFolder
        .add(
          {
            button: () => {
              isWireframeActive = !isWireframeActive;

              if (isWireframeActive) {
                this.mapModel.material = this.wireframeMaterial;
                this.debugFolderMap.close();
                this.debugFolderWireframe.open();
              } else {
                this.mapModel.material = this.terrainMaterial;
                this.debugFolderMap.open();
                this.debugFolderWireframe.close();
              }
            },
          },
          "button"
        )
        .name("Toggle Map Material");

      this.debugFolderMap = this.debugFolder.addFolder("Terrain Material");
      this.debugFolderMap.close();
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

      this.debugFolderWireframe =
        this.debugFolder.addFolder("Wireframe Material");
      // Dash Debug
      this.debugDashFolder = this.debugFolder.addFolder("Dash");
      this.debugDashFolder
        .add(this.options, "uDashEnabled")
        .name("Dash Enabled")
        .onChange(() => {
          this.wireframeMaterial.uniforms.uDashEnabled.value =
            this.options.uDashEnabled;
        });
      this.debugDashFolder
        .add(this.options, "uDashRepeats")
        .name("Repeats")
        .min(1)
        .max(10)
        .step(1)
        .onChange(() => {
          this.wireframeMaterial.uniforms.uDashRepeats.value =
            this.options.uDashRepeats;
        });
      this.debugDashFolder
        .add(this.options, "uDashOverlap")
        .name("Overlap Join")
        .onChange(() => {
          this.wireframeMaterial.uniforms.uDashOverlap.value =
            this.options.uDashOverlap;
        });
      this.debugDashFolder
        .add(this.options, "uDashLength")
        .name("Dash Length")
        .min(0.1)
        .max(1)
        .step(0.01)
        .onChange(() => {
          this.wireframeMaterial.uniforms.uDashLength.value =
            this.options.uDashLength;
        });
      this.debugDashFolder
        .add(this.options, "uDashAnimate")
        .name("Dash Animate")
        .onChange(() => {
          this.wireframeMaterial.uniforms.uDashAnimate.value =
            this.options.uDashAnimate;
        });
      // Visual Debug
      this.debugVisualFolder = this.debugFolderWireframe.addFolder("Visual");

      this.debugVisualFolder
        .addColor(this.options, "uFill")
        .name("Fill color")
        .onChange(() => {
          this.wireframeMaterial.uniforms.uFill.value.set(this.options.uFill);
        });
      this.debugVisualFolder
        .addColor(this.options, "uStroke")
        .name("Stroke color")
        .onChange(() => {
          this.wireframeMaterial.uniforms.uStroke.value.set(
            this.options.uStroke
          );
        });
      this.debugVisualFolder
        .add(this.options, "uThickness")
        .name("Thickness")
        .min(0.005)
        .max(0.2)
        .step(0.001)
        .onChange(() => {
          this.wireframeMaterial.uniforms.uThickness.value =
            this.options.uThickness;
        });

      this.debugVisualFolder
        .add(this.options, "uSqueeze")
        .name("Squeeze")
        .onChange(() => {
          this.wireframeMaterial.uniforms.uSqueeze.value =
            this.options.uSqueeze;
        });
      this.debugVisualFolder
        .add(this.options, "uSqueezeMin")
        .name("Squeeze Min")
        .min(0.0)
        .max(1)
        .step(0.01)
        .onChange(() => {
          this.wireframeMaterial.uniforms.uSqueezeMin.value =
            this.options.uSqueezeMin;
        });
      this.debugVisualFolder
        .add(this.options, "uSqueezeMax")
        .name("Squeeze Max")
        .min(0.0)
        .max(1)
        .step(0.01)
        .onChange(() => {
          this.wireframeMaterial.uniforms.uSqueezeMax.value =
            this.options.uSqueezeMax;
        });
    }
  }

  update() {
    this.wireframeMaterial.uniforms.uTime.value = this.time.elapsedTime;
  }
}
