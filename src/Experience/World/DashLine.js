import * as THREE from "three";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { gsap } from "gsap";

import Experience from "../Experience";
import { findMissingSteps } from "../Utils/Utils.js";

// import { Maf } from "../Utils/Maf";

export default class DashLine {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;
    this.debug = this.experience.debug;
    this.time = this.experience.time;
    this.inputEvents = this.experience.inputEvents;
    this.manager = this.experience.manager;
    this.resources = this.experience.resources;
    this.helpers = this.experience.helpers;
    this.transformControls = this.experience.helpers.transformControls;

    // Options
    this.options = {
      // Line
      chapterOne: {
        color: new THREE.Color(0xffffff),
        lineWidth: 18,
        dashArray: 0.01,
        dashRatio: 0.5,
        dashOffset: 0,
        visibility: 0,
      },
      chapterTwo: {
        color: new THREE.Color(0xffffff),
        lineWidth: 18,
        dashArray: 0.01,
        dashRatio: 0.5,
        dashOffset: 0,
        visibility: 0,
      },
      chapterTree: {
        color: new THREE.Color(0xffffff),
        lineWidth: 18,
        dashArray: 0.01,
        dashRatio: 0.5,
        dashOffset: 0,
        visibility: 0,
      },
    };

    // Setup
    this.scrollProgress = 0;
    this.progress = {
      chapterOne: [0, 0.285, 0.361, 0.49, 0.852, 1],
      chapterTwo: [0.177, 1],
      chapterTree: [],
    };
    this.revealedSteps = {
      chapterOne: [0],
      chapterTwo: [0],
      chapterTree: [0],
    };
    this.materials = {};

    this.points = {
      chapterOne: [
        new THREE.Vector3(-4.29, 1.43, -9.07),
        new THREE.Vector3(-3.61, 1.8, -8.42),
        new THREE.Vector3(-2.49, 1.69, -7.47),
        new THREE.Vector3(-1.57, 1.74, -7.69),
        new THREE.Vector3(0.08, 1.92, -7.57),
        new THREE.Vector3(2.17, 2.16, -8.01),
        new THREE.Vector3(4.87, 2.67, -8.23),
        new THREE.Vector3(5.7, 2.65, -8.74),
        new THREE.Vector3(6.46, 2.87, -10.08),
        new THREE.Vector3(7.04, 2.97, -11.61),
        new THREE.Vector3(8.23, 3.2, -12.99),
        new THREE.Vector3(12.16, 3.44, -15.14),
        new THREE.Vector3(15.63, 3.62, -15.48),
        new THREE.Vector3(19.45, 3.75, -14.67),
        new THREE.Vector3(20.67, 4, -15.35),
      ],
      chapterTwo: [
        new THREE.Vector3(20.67, 4, -15.35),
        new THREE.Vector3(21.28, 3.95, -15.03),
        new THREE.Vector3(21.39, 4.29, -15.85),
        new THREE.Vector3(21.59, 4.03, -15.03),
        new THREE.Vector3(22.41, 3.94, -14.34),
        new THREE.Vector3(23.4, 4.31, -14.34),
        new THREE.Vector3(24.69, 5.0, -15.29),
        new THREE.Vector3(25.23, 4.74, -14.35),
        new THREE.Vector3(25.05, 4.33, -13.75),
        new THREE.Vector3(24.39, 4.42, -13.93),
        new THREE.Vector3(23.18, 4.05, -13.98),
        new THREE.Vector3(22.47, 3.94, -14.28),
      ],
      chapterTree: [
        new THREE.Vector3(25.67, 4, -15.35),
        new THREE.Vector3(25.39, 4.39, -15.85),
        new THREE.Vector3(25.69, 5.14, -15.29),
      ],
    };

    this.curvePoints = {
      chapterOne: [],
      chapterTwo: [],
      chapterTree: [],
    };

    this.curves = {
      chapterOne: [],
      chapterTwo: [],
      chapterTree: [],
    };

    this.geometries = {
      chapterOne: [],
      chapterTwo: [],
      chapterTree: [],
    };
    this.meshes = {
      chapterOne: [],
      chapterTwo: [],
      chapterTree: [],
    };
    this.setMaterial();
    this.setDashLine();
    this.initEvents();

    // Debug
    this.setDebug();
  }

  initEvents() {
    this.manager.on("dashline-show", this.showDashLine.bind(this));
    // Scroll event
    this.inputEvents.on("wheel", this.onMouseWheel.bind(this));
    // this.manager.on("dashline-update", this.updateDashLine.bind(this));
  }

  onMouseWheel() {
    if (
      this.manager.isScrollingEnabled() &&
      !this.manager.getZoomState() &&
      this.manager.getMode() === "normal"
    ) {
      let delta = 0.025;

      const targetScrollProgress = (this.scrollProgress += delta);
      console.log(targetScrollProgress);
    }
  }

  setMaterial() {
    const material = new MeshLineMaterial({
      color: this.options.chapterOne.color,
      lineWidth: this.options.chapterOne.lineWidth,
      resolution: new THREE.Vector2(this.sizes.width, this.sizes.height),
      dashArray: this.options.chapterOne.dashArray,
      dashRatio: this.options.chapterOne.dashRatio,
      dashOffset: this.options.chapterOne.dashOffset,
      visibility: this.options.chapterOne.visibility,
      sizeAttenuation: false,
      depthTest: true,
      transparent: true,
    });

    this.materials = {
      chapterOne: material.clone(),
      chapterTwo: material.clone(),
      chapterTree: material.clone(),
    };
  }

  // Working Demo : https://lume.github.io/three-meshline/demo/index.html
  setDashLine() {
    Object.entries(this.points).forEach(([chapter, points]) => {
      this.geometries[chapter] = new MeshLineGeometry();

      if (this.debug.active) {
        points.forEach((point, index) => {
          const curvePoint = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshNormalMaterial()
          );
          curvePoint.position.set(point.x, point.y, point.z);
          curvePoint.scale.set(0.1, 0.1, 0.1);
          curvePoint.index = index;
          curvePoint.type = "dashLine";
          curvePoint.visible = false;
          curvePoint.chapter = chapter;
          curvePoint.name = `dashLine.curvepoint.${chapter}.${index}`;

          this.curvePoints[chapter].push(curvePoint);
          this.scene.add(curvePoint);

          this.manager.addClickEventToMesh(curvePoint, () => {
            this.helpers.setActiveMesh(curvePoint);
          });
        });
      }

      this.curves[chapter] = new THREE.CatmullRomCurve3(
        this.points[chapter]
      ).getPoints(500);

      this.geometries[chapter].setPoints(this.curves[chapter]);

      this.meshes[chapter] = new THREE.Mesh(
        this.geometries[chapter],
        this.materials[chapter]
      );
      this.scene.add(this.meshes[chapter]);
    });
  }

  updateDashLine(progress) {
    const currentChapter = this.manager.getCurrentChapter();
    const material = this.materials[currentChapter];
    const test = progress + 0.25;
    gsap.to(material.uniforms.visibility, {
      value: test,
      duration: 1,
      ease: "power1.inOut",
      onUpdate: () => {},
      onComplete: () => {},
    });
  }

  showDashLine(index, name) {
    const currentChapter = this.manager.getCurrentChapter();
    const progressTarget = this.progress[currentChapter][index];
    // We add the index to the revealed Steps
    this.revealedSteps[currentChapter].push(index);
    // We find if there are some missings steps along the path
    const missingSteps = findMissingSteps(this.revealedSteps[currentChapter]);
    // Track which steps have been revealed to prevent duplicate triggers
    const revealed = {};
    // Animation of the DashLine
    const material = this.materials[currentChapter];
    gsap.to(material.uniforms.visibility, {
      value: progressTarget,
      duration: 3,
      ease: "power1.inOut",
      onUpdate: () => {
        // on Update we want to ensure we are not missing any props to reveal
        const currentProgress = material.uniforms.visibility.value;
        // Iterate through missingSteps to see if any matches current progress
        missingSteps.forEach((missingIndex) => {
          const missingProgress = this.progress[currentChapter][missingIndex];
          // Check if the current progress is close enough to the missingProgress
          // and that it hasn't been revealed yet
          if (
            !revealed[missingIndex] &&
            Math.abs(currentProgress - missingProgress) < 0.01 // since we don't exactly get the values of the dash we are using a threshold
          ) {
            // we add the missing index to the revealedSteps
            this.revealedSteps[currentChapter].push(missingIndex);
            console.log(
              `Revealed dashLine for missing Step ${missingIndex}(${name}) of ${currentChapter}`
            );
            this.manager.trigger("props-reveal", missingIndex);
            // we mark the steps as revealed to ensure it's not triggering twice because of the threshold
            revealed[missingIndex] = true;
          }
        });
      },
      onComplete: () => {
        console.log(
          `Revealed dashLine for Step ${index}(${name}) of ${currentChapter}`
        );
        this.manager.trigger("props-reveal", index);
      },
    });
  }

  resize() {
    Object.entries(this.materials).forEach(([chapter, material]) => {
      material.uniforms.resolution.value.x = this.sizes.width;
      material.uniforms.resolution.value.y = this.sizes.height;
    });
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Dash Line");
      this.debugFolder.close();

      this.debugFolders = {
        chapterOne: this.debugFolder.addFolder("chapter One"),
        chapterTwo: this.debugFolder.addFolder("chapter Two"),
        chapterTree: this.debugFolder.addFolder("chapter Tree"),
      };

      Object.entries(this.materials).forEach(([chapter, material]) => {
        const debugFolder = this.debugFolders[chapter];
        debugFolder.close();
        debugFolder
          .addColor(this.options[chapter], "color")
          .name("Color")
          .onChange(() => {
            this.materials[chapter].color = new THREE.Color(
              this.options[chapter].color
            );
          });
        debugFolder
          .add(this.options[chapter], "lineWidth")
          .name("Line Width")
          .min(0)
          .max(30)
          .step(0.001)
          .onChange(() => {
            this.materials[chapter].uniforms.lineWidth.value =
              this.options[chapter].lineWidth;
          });
        debugFolder
          .add(this.options[chapter], "dashArray")
          .name("Dash Array")
          .min(0)
          .max(1)
          .step(0.001)
          .onChange(() => {
            this.materials[chapter].uniforms.dashArray.value =
              this.options[chapter].dashArray;
          });
        debugFolder
          .add(this.options[chapter], "dashRatio")
          .name("Dash Ratio")
          .min(-0)
          .max(1)
          .step(0.001)
          .onChange(() => {
            this.materials[chapter].uniforms.dashRatio.value =
              this.options[chapter].dashRatio;
          });
        debugFolder
          .add(this.options[chapter], "dashOffset")
          .name("Dash Offset")
          .min(-20)
          .max(20)
          .onChange(() => {
            this.materials[chapter].uniforms.dashOffset.value =
              this.options[chapter].visibility;
          });
        debugFolder
          .add(this.options[chapter], "visibility")
          .name("Visibility")
          .min(0)
          .max(1)
          .onChange(() => {
            this.materials[chapter].uniforms.visibility.value =
              this.options[chapter].visibility;
          });
      });

      this.debug.debugEditorFolder
        .add(
          {
            button: () => {
              this.options.visibility = 1;
              Object.entries(this.materials).forEach(([chapter, material]) => {
                material.uniforms.visibility.value = this.options.visibility;
              });
              this.debugFolder.controllers.forEach((controller) => {
                controller.updateDisplay();
              });

              this.transformControls.detach();

              Object.entries(this.curvePoints).forEach(
                ([chapter, curvePoints]) => {
                  curvePoints.forEach((curvePoint) => {
                    curvePoint.visible = !curvePoint.visible;
                  });
                }
              );
            },
          },
          "button"
        )
        .name("Dash Line Helper");

      this.transformControls.addEventListener("dragging-changed", (event) => {
        const transformedPoint = this.transformControls.object;
        const index = transformedPoint.index;
        const type = transformedPoint.type;
        const chapter = transformedPoint.chapter;

        if (!event.value && type === "dashLine") {
          this.points[chapter][index] = new THREE.Vector3(
            transformedPoint.position.x,
            transformedPoint.position.y,
            transformedPoint.position.z
          );
          this.curves[chapter] = new THREE.CatmullRomCurve3(
            this.points[chapter]
          ).getPoints(500);

          this.geometries[chapter].setPoints(this.curves[chapter]);

          this.meshes[chapter].geometry = this.geometries[chapter];
          // if point is from camera type we update the target curve
          console.log(
            `New dashLine ${chapter} Position:`,
            index,
            `new THREE.Vector3(${transformedPoint.position.x.toFixed(
              2
            )},${transformedPoint.position.y.toFixed(
              2
            )},${transformedPoint.position.z.toFixed(2)})`
          );
        }
      });
    }
  }

  update() {}
}
