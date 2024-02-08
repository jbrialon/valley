import * as THREE from "three";
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
    this.helpers = this.experience.helpers;
    this.transformControls = this.experience.helpers.transformControls;

    // Options
    this.options = {};

    // Setup
    this.setPaths();

    // Debug
    this.setDebug();
  }

  setPaths() {
    this.cameraCurve = new THREE.CatmullRomCurve3(paths.camera);

    if (this.debug.active) {
      this.curveCameraPoints = [];
      paths.camera.forEach((point, index) => {
        const curvePoint = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshNormalMaterial()
        );
        curvePoint.position.set(point.x, point.y, point.z);
        curvePoint.scale.set(0.1, 0.1, 0.1);
        curvePoint.index = index;
        curvePoint.type = "camera";
        curvePoint.visible = false;
        curvePoint.name = `path.camera.curvepoint.${index}`;
        this.curveCameraPoints.push(curvePoint);
        this.scene.add(curvePoint);

        this.manager.addClickEventToMesh(curvePoint, () => {
          this.helpers.setActiveMesh(curvePoint);
        });
      });
    }
    this.cameraPoints = this.cameraCurve.getPoints(50);
    this.cameraGeometry = new THREE.BufferGeometry().setFromPoints(
      this.cameraPoints
    );

    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    this.cameraCurveMesh = new THREE.Line(this.cameraGeometry, material);
    this.cameraCurveMesh.visible = false;
    this.scene.add(this.cameraCurveMesh);

    this.targetCurve = new THREE.CatmullRomCurve3(paths.target);

    if (this.debug.active) {
      this.curveTargetPoints = [];
      paths.target.forEach((point, index) => {
        const curvePoint = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshNormalMaterial()
        );
        curvePoint.position.set(point.x, point.y, point.z);
        curvePoint.scale.set(0.1, 0.1, 0.1);
        curvePoint.index = index;
        curvePoint.type = "target";
        curvePoint.visible = false;
        curvePoint.name = `path.target.curvepoint.${index}`;
        this.curveTargetPoints.push(curvePoint);
        this.scene.add(curvePoint);

        this.manager.addClickEventToMesh(curvePoint, () => {
          this.helpers.setActiveMesh(curvePoint);
        });
      });
    }

    this.targetPoints = this.targetCurve.getPoints(50);
    this.targetGeometry = new THREE.BufferGeometry().setFromPoints(
      this.targetPoints
    );

    this.targetCurveMesh = new THREE.Line(
      this.targetGeometry,
      new THREE.LineBasicMaterial({ color: 0x599fd3 })
    );
    this.targetCurveMesh.visible = false;
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
    this.fakeTarget.visible = false;
    this.scene.add(this.fakeTarget);
  }

  setDebug() {
    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.debugEditorFolder;
      // this.debugFolder.close();

      this.debugFolder
        .add(
          {
            button: () => {
              this.transformControls.detach();
              this.curveCameraPoints.forEach((curvePoint) => {
                curvePoint.visible = !curvePoint.visible;
              });
              this.cameraCurveMesh.visible = !this.cameraCurveMesh.visible;
            },
          },
          "button"
        )
        .name("Toggle Camera Path");

      this.debugFolder
        .add(
          {
            button: () => {
              this.transformControls.detach();
              this.curveTargetPoints.forEach((curvePoint) => {
                curvePoint.visible = !curvePoint.visible;
              });
              this.fakeTarget.visible = !this.fakeTarget.visible;
              this.targetCurveMesh.visible = !this.targetCurveMesh.visible;
            },
          },
          "button"
        )
        .name("Toggle Target Path");

      this.transformControls.addEventListener("dragging-changed", (event) => {
        const transformedPoint = this.transformControls.object;
        const index = transformedPoint.index;
        const type = transformedPoint.type;

        if (!event.value && (type === "camera" || type === "target")) {
          // if point is from camera type we update the camera curve
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
            // if point is from camera type we update the target curve
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
          console.log(
            `New ${type} Position:`,
            index,
            `new THREE.Vector3(${transformedPoint.position.x.toFixed(
              2
            )},${transformedPoint.position.y.toFixed(
              2
            )},${transformedPoint.position.z.toFixed(2)})`
          );
        }
        this.camera.setPaths();
      });
    }
  }

  update() {}
}
