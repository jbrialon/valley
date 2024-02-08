import * as THREE from "three";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { gsap } from "gsap";

import Experience from "../Experience";
import { findMissingSteps } from "../Utils/utils.js";

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
      color: new THREE.Color(0xffffff),
      lineWidth: 18,
      dashArray: 0.01,
      dashRatio: 0.5,
      dashOffset: 0,
      visibility: 0,
      progress: [0, 0.285, 0.361, 0.49, 0.852, 1],
    };

    // Setup
    this.revealSteps = [0];
    this.point = new THREE.Vector3();
    this.points = [
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
      new THREE.Vector3(19.45, 4.02, -14.67),
      new THREE.Vector3(20.67, 4, -15.35),
    ];
    this.curvePoint = [];

    this.setMaterial();
    this.setDashLine();
    this.initEvents();

    // Debug
    this.setDebug();
  }

  setMaterial() {
    this.material = new MeshLineMaterial({
      color: this.options.color,
      lineWidth: this.options.lineWidth,
      resolution: new THREE.Vector2(this.sizes.width, this.sizes.height),
      dashArray: this.options.dashArray,
      dashRatio: this.options.dashRatio,
      dashOffset: this.options.dashOffset,
      visibility: this.options.visibility,
      sizeAttenuation: false,
      depthTest: true,
      transparent: true,
    });
  }

  // Working Demo : https://lume.github.io/three-meshline/demo/index.html
  setDashLine() {
    this.geometry = new MeshLineGeometry();

    this.points.forEach((point, index) => {
      const curvePoint = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshNormalMaterial()
      );
      curvePoint.position.set(point.x, point.y, point.z);
      curvePoint.scale.set(0.1, 0.1, 0.1);
      curvePoint.index = index;
      curvePoint.type = "dashLine";
      curvePoint.visible = false;
      curvePoint.name = `dashLine.curvepoint.${index}`;

      this.curvePoint.push(curvePoint);
      this.scene.add(curvePoint);

      this.manager.addClickEventToMesh(curvePoint, () => {
        this.helpers.setActiveMesh(curvePoint);
      });
    });

    this.curve = new THREE.CatmullRomCurve3(this.points).getPoints(500);

    this.geometry.setPoints(this.curve);

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  showPath(index, name) {
    const progressTarget = this.options.progress[index];
    // We add the index to the revealed Steps
    this.revealSteps.push(index);
    // We find if there are some missings steps along the path
    const missingSteps = findMissingSteps(this.revealSteps);
    // Track which steps have been revealed to prevent duplicate triggers
    const revealed = {};
    // Animation of the DashLine
    gsap.to(this.material.uniforms.visibility, {
      value: progressTarget,
      duration: 3 * (missingSteps.length + 1),
      ease: "power4.inOut",
      onUpdate: () => {
        // on Update we want to ensure we are not missing any props to reveal
        const currentProgress = this.material.uniforms.visibility.value;
        // Iterate through missingSteps to see if any matches current progress
        missingSteps.forEach((missingIndex) => {
          const missingProgress = this.options.progress[missingIndex];
          // Check if the current progress is close enough to the missingProgress
          // and that it hasn't been revealed yet
          if (
            !revealed[missingIndex] &&
            Math.abs(currentProgress - missingProgress) < 0.01 // since we don't exactly get the values of the dash we are using a threshold
          ) {
            // we add the missing index to the revealedSteps
            this.revealSteps.push(missingIndex);
            this.manager.trigger("revealProps", missingIndex);
            // we mark the steps as revealed to ensure it's not triggering twice because of the threshold
            revealed[missingIndex] = true;
          }
        });
      },
      onComplete: () => {
        this.manager.trigger("revealProps", index);
      },
    });
    // Debug
    console.log(
      `Show Path ${progressTarget} going to ${name}, missing steps: ${missingSteps}`
    );
  }

  initEvents() {
    this.manager.on("showDashLine", this.showPath.bind(this));
  }

  resize() {
    this.material.uniforms.resolution.value.x = this.sizes.width;
    this.material.uniforms.resolution.value.y = this.sizes.height;
  }

  setDebug() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Dash Line");
      this.debugFolder.close();
      this.debugFolder
        .addColor(this.options, "color")
        .name("Color")
        .onChange(() => {
          this.material.color = new THREE.Color(this.options.color);
        });
      this.debugFolder
        .add(this.options, "lineWidth")
        .name("Line Width")
        .min(0)
        .max(30)
        .step(0.001)
        .onChange(() => {
          this.material.uniforms.lineWidth.value = this.options.lineWidth;
        });
      this.debugFolder
        .add(this.options, "dashArray")
        .name("Dash Array")
        .min(0)
        .max(1)
        .step(0.001)
        .onChange(() => {
          this.material.uniforms.dashArray.value = this.options.dashArray;
        });
      this.debugFolder
        .add(this.options, "dashRatio")
        .name("Dash Ratio")
        .min(-0)
        .max(1)
        .step(0.001)
        .onChange(() => {
          this.material.uniforms.dashRatio.value = this.options.dashRatio;
        });
      this.debugFolder
        .add(this.options, "dashOffset")
        .name("Dash Offset")
        .min(-20)
        .max(20)
        .onChange(() => {
          this.material.uniforms.dashOffset.value = this.options.visibility;
        });
      this.debugFolder
        .add(this.options, "visibility")
        .name("Visibility")
        .min(0)
        .max(1)
        .onChange(() => {
          this.material.uniforms.visibility.value = this.options.visibility;
        });
      this.debug.debugEditorFolder
        .add(
          {
            button: () => {
              this.options.visibility = 1;
              this.material.uniforms.visibility.value = this.options.visibility;
              this.debugFolder.controllers.forEach((controller) => {
                controller.updateDisplay();
              });

              this.transformControls.detach();
              this.curvePoint.forEach((curvePoint) => {
                curvePoint.visible = !curvePoint.visible;
              });
            },
          },
          "button"
        )
        .name("Dash Line Helper");

      this.transformControls.addEventListener("dragging-changed", (event) => {
        const transformedPoint = this.transformControls.object;
        const index = transformedPoint.index;
        const type = transformedPoint.type;

        if (!event.value && type === "dashLine") {
          this.points[index] = new THREE.Vector3(
            transformedPoint.position.x,
            transformedPoint.position.y,
            transformedPoint.position.z
          );
          this.curve = new THREE.CatmullRomCurve3(this.points).getPoints(500);

          this.geometry.setPoints(this.curve);

          this.mesh.geometry = this.geometry;
          // if point is from camera type we update the target curve
          console.log(
            "New dashLine Position:",
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
