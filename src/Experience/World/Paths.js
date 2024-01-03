import * as THREE from "three";
import { gsap } from "gsap";
import Experience from "../Experience";

import paths from "../Data/paths.js";

export default class Paths {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.debug = this.experience.debug;
    this.time = this.experience.time;
    this.manager = this.experience.manager;
    this.camera = this.experience.camera;
    this.transformControls = this.experience.helpers.transformControls;

    // Options
    this.options = {};

    // Setup
    this.setPaths();
    this.setControls();

    // Debug
    this.setDebug();
  }

  setPaths() {
    this.cameraCurve = new THREE.CatmullRomCurve3(paths.camera);
    paths.camera.forEach((point, index) => {
      const curvePoint = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshNormalMaterial()
      );
      curvePoint.position.set(point.x, point.y, point.z);
      curvePoint.scale.set(0.1, 0.1, 0.1);
      curvePoint.index = index;
      curvePoint.type = "camera";
      curvePoint.visible = this.debug.active;
      this.scene.add(curvePoint);

      this.manager.addClickEventToMesh(curvePoint, () => {
        this.transformControls.attach(curvePoint);
      });
    });

    this.cameraPoints = this.cameraCurve.getPoints(50);
    this.cameraGeometry = new THREE.BufferGeometry().setFromPoints(
      this.cameraPoints
    );

    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    this.cameraCurveMesh = new THREE.Line(this.cameraGeometry, material);
    this.cameraCurveMesh.visible = this.debug.active;
    this.scene.add(this.cameraCurveMesh);

    this.targetCurve = new THREE.CatmullRomCurve3(paths.target);

    paths.target.forEach((point, index) => {
      const curvePoint = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshNormalMaterial()
      );
      curvePoint.position.set(point.x, point.y, point.z);
      curvePoint.scale.set(0.1, 0.1, 0.1);
      curvePoint.index = index;
      curvePoint.type = "target";
      curvePoint.visible = this.debug.active;
      this.scene.add(curvePoint);

      if (this.debug.active) {
        this.manager.addClickEventToMesh(curvePoint, () => {
          this.transformControls.attach(curvePoint);
        });
      }
    });

    this.targetPoints = this.targetCurve.getPoints(50);
    this.targetGeometry = new THREE.BufferGeometry().setFromPoints(
      this.targetPoints
    );

    this.targetCurveMesh = new THREE.Line(
      this.targetGeometry,
      new THREE.LineBasicMaterial({ color: 0x599fd3 })
    );
    this.targetCurveMesh.visible = this.debug.active;
    this.scene.add(this.targetCurveMesh);

    this.fakeTarget = new THREE.Mesh(
      new THREE.SphereGeometry(1, 16, 16),
      new THREE.MeshNormalMaterial()
    );
    this.fakeTarget.scale.set(0.1, 0.1, 0.1);
    this.fakeTarget.position.set(
      paths.target[0].x,
      paths.target[0].y,
      paths.target[0].z
    );
    this.fakeTarget.visible = this.debug.active;
    this.scene.add(this.fakeTarget);
  }

  setControls() {
    if (this.debug.active) {
      this.transformControls.addEventListener("dragging-changed", (event) => {
        if (!event.value) {
          const transformedPoint = this.transformControls.object;
          const index = transformedPoint.index;
          const type = transformedPoint.type;
          if (type === "camera") {
            paths.camera[index] = new THREE.Vector3(
              transformedPoint.position.x,
              transformedPoint.position.y,
              transformedPoint.position.z
            );
            this.cameraCurve = new THREE.CatmullRomCurve3(paths.camera);
            this.cameraPoints = this.cameraCurve.getPoints(50);
            this.cameraGeometry = new THREE.BufferGeometry().setFromPoints(
              this.cameraPoints
            );

            this.cameraCurveMesh.geometry = this.cameraGeometry;
          } else if (type === "target") {
            paths.target[index] = new THREE.Vector3(
              transformedPoint.position.x,
              transformedPoint.position.y,
              transformedPoint.position.z
            );
            this.targetCurve = new THREE.CatmullRomCurve3(paths.target);
            this.targetPoints = this.targetCurve.getPoints(50);
            this.targetGeometry = new THREE.BufferGeometry().setFromPoints(
              this.targetPoints
            );

            this.targetCurveMesh.geometry = this.targetGeometry;
          }
          console.log("New Point Position: ", index, transformedPoint.position);
        }
        this.camera.setPaths();
      });
    }
  }

  setDebug() {
    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Paths");
      this.debugFolder.close();
    }
  }
}
