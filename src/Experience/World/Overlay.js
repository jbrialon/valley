import * as THREE from "three";
import { gsap } from "gsap";
import Experience from "../Experience";

import overlayMaterial from "../Materials/OverlayMaterial";
import overlay2Material from "../Materials/Overlay2Material";

import { addBarycentricCoordinates } from "../Utils/Geometry";

export default class Overlay {
  constructor(options) {
    this.experience = new Experience();
    this.options = options;
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;
    this.time = this.experience.time;
    this.inputEvents = this.experience.inputEvents;
    this.manager = this.experience.manager;
    this.raycaster = this.experience.renderer.raycaster;
    this.camera = this.experience.camera;
    this.resources = this.experience.resources;
    this.transformControls = this.experience.helpers.transformControls;

    // Options
    this.options = {
      uAlpha: 1,
      uCirclePos: [
        new THREE.Vector2(0, 0), // Mouse position
        new THREE.Vector2(0.5709589045068721, 0.7096687321470818), // Syabru Besi
        new THREE.Vector2(0.5077445414629836, 0.6746022993310021), // Pairo
        new THREE.Vector2(0.47512453334237614, 0.6858865351558925), // Bamboo
        new THREE.Vector2(0.4256830893906932, 0.7012801433406837), // Lama Hotel
        // new THREE.Vector2(0.39614378653702853, 0.7886999878761154), // Lang Tang River
        new THREE.Vector2(0.28152391589700954, 0.8545268048548473), // Langtang
        new THREE.Vector2(0.2084770396380733, 0.852437698451759), // Kyanjin Gompa
        new THREE.Vector2(0.19701931240843318, 0.8622552370376909), // Kyanjin Ri
        new THREE.Vector2(0.14921005272124777, 0.8487431163471764), // Tserko Ri
        new THREE.Vector2(0.5413955982456653, 0.6508027193055853), // Thulo Syabru
        // TODO: the rest
      ],
      uCircleRadius: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      offsetPosY: 0.001,

      // Overlay 1
      uStrength: 0.5,
      uLineColor: "#53524c", // #74675e
      uColorOne: "#f4814a", // #6a5e52
      uColorTwo: "#eda17f",
      uColorThree: "#e45221",
      uColorNumber: 2,
      uContourWidth: 1,
      uContourFrequency: 2.7,

      // Overlay 2
      uFill: new THREE.Color(0xde9e7b),
      uStroke: new THREE.Color(0xf4e2d6),
      uThickness: 0.04,
      uDashEnabled: true,
      uDashRepeats: 2.0,
      uDashOverlap: true,
      uDashLength: 0.55,
      uDashAnimate: false,
      uSqueeze: false,
      uSqueezeMin: 0.2,
      uSqueezeMax: 1,

      // gsap options
      circleSizes: [1.8, 0.6, 0.6, 1.8, 1.8, 1.8, 0.6, 1.2, 1.2],
    };

    // Setup
    this.point = null;
    this.resource = this.resources.items.mapModel;

    // Setup
    this.setMaterial();
    this.setModel();
    this.initEvents();

    // Debug
    this.setDebug();
  }

  setMaterial() {
    this.overlayMaterial = overlayMaterial({
      uAlpha: this.options.uAlpha,
      uStrength: this.options.uStrength,
      uPixelRatio: this.sizes.pixelRatio,
      uContourWidth: this.options.uContourWidth,
      uColorNumber: this.options.uColorNumber,
      uContourFrequency: this.options.uContourFrequency,
      uLineColor: this.options.uLineColor,
      uColorOne: this.options.uColorOne,
      uColorTwo: this.options.uColorTwo,
      uColorThree: this.options.uColorThree,
      uCirclePos: this.options.uCirclePos,
      uCircleRadius: this.options.uCircleRadius,
    });

    this.overlay2Material = overlay2Material({
      uAlpha: this.options.uAlpha,
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
      // Mask
      uCirclePos: this.options.uCirclePos,
      uCircleRadius: this.options.uCircleRadius,
    });

    this.activeMaterial = this.overlay2Material;
  }

  setModel() {
    this.model = this.resource.scene.clone();

    this.overlayModel = null;
    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name === "map") {
        child.geometry = child.geometry.toNonIndexed();
        addBarycentricCoordinates(child.geometry, true);
        child.geometry.computeBoundsTree();
        this.overlayModel = child;
        this.overlayModel.layers.enable(1);
      } else if (child.name !== "Scene") {
        child.visible = false;
      }
    });

    this.overlayModel.material = this.activeMaterial;
    this.model.position.y = this.options.offsetPosY;
    this.scene.add(this.model);
  }

  initEvents() {
    // Mouse Events
    this.inputEvents.on("mousemove", this.onMouseMove.bind(this));

    this.inputEvents.on("pressDown", this.onPressDown.bind(this));

    this.inputEvents.on("pressUp", this.onPressUp.bind(this));

    this.manager.on("revealOverlay", this.revealOverlay.bind(this));

    this.manager.on("updateColors", (colors) => {
      // Overlay 1
      this.options.uColorOne = new THREE.Color(colors[2]);
      this.overlayMaterial.uniforms.uColorOne.value.set(this.options.uColorOne);
      this.options.uColorTwo = new THREE.Color(colors[3]);
      this.overlayMaterial.uniforms.uColorTwo.value.set(this.options.uColorTwo);
      this.options.uColorThree = new THREE.Color(colors[4]);
      this.overlayMaterial.uniforms.uColorThree.value.set(
        this.options.uColorThree
      );

      this.options.uLineColor = new THREE.Color(colors[1]);
      this.overlayMaterial.uniforms.uLineColor.value.set(
        this.options.uLineColor
      );

      // Overlay 2
      this.options.uFill = new THREE.Color(colors[4]);
      this.overlay2Material.uniforms.uFill.value.set(this.options.uFill);
      this.options.uStroke = new THREE.Color(colors[1]);
      this.overlay2Material.uniforms.uStroke.value.set(this.options.uStroke);

      this.debugVisualFolder.controllers.forEach((controller) => {
        controller.updateDisplay();
      });
    });
  }

  onMouseMove() {
    if (!this.transformControls?.enabled) {
      // calculate the position of the mouse based with center as origin
      const mouse = new THREE.Vector2(
        (this.inputEvents.mouse.x / this.sizes.width) * 2 - 1,
        -(this.inputEvents.mouse.y / this.sizes.height) * 2 + 1
      );

      // Update the raycaster with the mouse coordinates
      this.raycaster.setFromCamera(mouse, this.camera.instance);

      // Perform raycasting to find intersections with the mesh
      const intersects = this.raycaster.intersectObject(this.overlayModel);

      if (intersects.length > 0) {
        // Get the UV coordinates where the mouse intersects the mesh
        const uv = new THREE.Vector2(
          1 - intersects[0].uv.x,
          1 - intersects[0].uv.y
        );
        this.activeMaterial.uniforms.uCirclePos.value[0].x = uv.x;
        this.activeMaterial.uniforms.uCirclePos.value[0].y = uv.y;
        if (this.inputEvents.isPressed) {
          this.point = intersects[0].point;
          this.manager.trigger("navigation", this.point);
        }
      }
    }
  }

  onPressDown() {
    if (!this.transformControls?.enabled) {
      gsap.to(this.activeMaterial.uniforms.uCircleRadius.value, {
        duration: 0.5,
        0: 3,
        ease: "power4.inOut",
      });
    }
  }

  onPressUp() {
    if (!this.transformControls?.enabled) {
      gsap.to(this.activeMaterial.uniforms.uCircleRadius.value, {
        duration: 0.5,
        0: 0,
        ease: "power4.inOut",
      });
    }
  }

  revealOverlay(index, name) {
    console.log("revealOverlay: ", index, name);
    const animationProps = {};
    animationProps[index + 1] = this.options.circleSizes[index] || 1.8;

    gsap.to(this.activeMaterial.uniforms.uCircleRadius.value, {
      duration: 0.5,
      ...animationProps,
      ease: "power4.inOut",
    });
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Overlay");
      this.debugFolder.close();

      let isOverlay2Active = true;
      this.debugFolder
        .add(
          {
            button: () => {
              isOverlay2Active = !isOverlay2Active;

              if (isOverlay2Active) {
                this.activeMaterial = this.overlay2Material;

                this.debugFolderMap.close();
                this.debugFolderWireframe.open();
              } else {
                this.activeMaterial = this.overlayMaterial;

                this.debugFolderMap.open();
                this.debugFolderWireframe.close();
              }
              this.overlayModel.material = this.activeMaterial;
            },
          },
          "button"
        )
        .name("Toggle Overlay Material");

      // Circle Mask
      this.debugCircleFolder = this.debugFolder.addFolder("Circle Mask");
      this.debugCircleFolder
        .add(this.activeMaterial.uniforms.uNoiseIntensity, "value")
        .min(10)
        .max(200)
        .step(0.01)
        .name("Intensity");

      this.debugFolderMap = this.debugFolder.addFolder("Terrain Material");
      this.debugFolderMap.close();
      this.debugFolderMap
        .add(this.overlayMaterial.uniforms.uAlpha, "value")
        .min(0)
        .max(1)
        .step(0.01)
        .name("Opacity");
      this.debugFolderMap
        .add(this.overlayMaterial.uniforms.uStrength, "value")
        .min(0)
        .max(1)
        .step(0.01)
        .name("Blend");
      this.debugFolderMap
        .add(this.overlayMaterial.uniforms.uContourWidth, "value")
        .min(0)
        .max(3)
        .step(0.001)
        .name("Contour Width");
      this.debugFolderMap
        .add(this.overlayMaterial.uniforms.uContourFrequency, "value")
        .min(0.1)
        .max(20)
        .step(0.1)
        .name("Contour Frequency");
      this.debugFolderMap
        .add(this.overlayMaterial.uniforms.uColorNumber, "value")
        .min(1)
        .max(3)
        .step(1)
        .name("Color Number");
      this.debugFolderMap
        .addColor(this.options, "uColorOne")
        .name("Color One")
        .onChange(() => {
          this.overlayMaterial.uniforms.uColorOne.value.set(
            this.options.uColorOne
          );
        });
      this.debugFolderMap
        .addColor(this.options, "uColorTwo")
        .name("Color Two")
        .onChange(() => {
          this.overlayMaterial.uniforms.uColorTwo.value.set(
            this.options.uColorTwo
          );
        });
      this.debugFolderMap
        .addColor(this.options, "uColorThree")
        .name("Color Two")
        .onChange(() => {
          this.overlayMaterial.uniforms.uColorThree.value.set(
            this.options.uColorThree
          );
        });
      this.debugFolderMap
        .addColor(this.options, "uLineColor")
        .name("Line Color")
        .onChange(() => {
          this.overlayMaterial.uniforms.uLineColor.value.set(
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
          this.overlay2Material.uniforms.uDashEnabled.value =
            this.options.uDashEnabled;
        });
      this.debugDashFolder
        .add(this.options, "uDashRepeats")
        .name("Repeats")
        .min(1)
        .max(10)
        .step(1)
        .onChange(() => {
          this.overlay2Material.uniforms.uDashRepeats.value =
            this.options.uDashRepeats;
        });
      this.debugDashFolder
        .add(this.options, "uDashOverlap")
        .name("Overlap Join")
        .onChange(() => {
          this.overlay2Material.uniforms.uDashOverlap.value =
            this.options.uDashOverlap;
        });
      this.debugDashFolder
        .add(this.options, "uDashLength")
        .name("Dash Length")
        .min(0.1)
        .max(1)
        .step(0.01)
        .onChange(() => {
          this.overlay2Material.uniforms.uDashLength.value =
            this.options.uDashLength;
        });
      this.debugDashFolder
        .add(this.options, "uDashAnimate")
        .name("Dash Animate")
        .onChange(() => {
          this.overlay2Material.uniforms.uDashAnimate.value =
            this.options.uDashAnimate;
        });
      // Visual Debug
      this.debugVisualFolder = this.debugFolderWireframe.addFolder("Visual");

      this.debugVisualFolder
        .addColor(this.options, "uFill")
        .name("Fill Color")
        .onChange(() => {
          this.overlay2Material.uniforms.uFill.value = this.options.uFill;
        });
      this.debugVisualFolder
        .addColor(this.options, "uStroke")
        .name("Stroke Color")
        .onChange(() => {
          this.overlay2Material.uniforms.uStroke.value = this.options.uStroke;
        });
      this.debugVisualFolder
        .add(this.options, "uThickness")
        .name("Thickness")
        .min(0.005)
        .max(0.2)
        .step(0.001)
        .onChange(() => {
          this.overlay2Material.uniforms.uThickness.value =
            this.options.uThickness;
        });
      this.debugVisualFolder
        .add(this.options, "uSqueeze")
        .name("Squeeze")
        .onChange(() => {
          this.overlay2Material.uniforms.uSqueeze.value = this.options.uSqueeze;
        });
      this.debugVisualFolder
        .add(this.options, "uSqueezeMin")
        .name("Squeeze Min")
        .min(0.0)
        .max(1)
        .step(0.01)
        .onChange(() => {
          this.overlay2Material.uniforms.uSqueezeMin.value =
            this.options.uSqueezeMin;
        });
      this.debugVisualFolder
        .add(this.options, "uSqueezeMax")
        .name("Squeeze Max")
        .min(0.0)
        .max(1)
        .step(0.01)
        .onChange(() => {
          this.overlay2Material.uniforms.uSqueezeMax.value =
            this.options.uSqueezeMax;
        });
    }
  }

  update() {
    this.activeMaterial.uniforms.uTime.value = this.time.elapsedTime * 0.015;
  }
}
