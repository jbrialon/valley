import * as THREE from "three";
import Experience from "../Experience";

import ElevationVertexShader from "../../shaders/elevation/vertex.glsl";
import ElevationFragmentShader from "../../shaders/elevation/fragment.glsl";

import wireFrameVertexShader from "../../shaders/wireframe/vertex.glsl";
import wireframeFragmentShader from "../../shaders/wireframe/fragment.glsl";

export default class Plane {
  constructor() {
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.resources = this.experience.resources;

    this.camera = this.experience.camera;

    // Options
    this.options = {
      uLineColor: "#f4e2d6", // #74675e
      uLineColor: "#53524c", // #74675e
      uColorOne: "#f4814a", // #6a5e52
      uColorTwo: "#eda17f",
      uColorThree: "#e45221",
      uColorNumber: 3,
      uContourFrequency: 3.3,
    };

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Map 2");
    }

    // Setup
    this.resource = this.resources.items.mapModel2;
    this.maskTexture = this.resources.items.maskTexture;

    // this.setElevationMaterial();
    this.setWireframeMaterial();
    this.setModel();
  }

  setWireframeMaterial() {
    this.wireFrameMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uAlpha: { value: 1 },
        uContourWidth: {
          value: 1,
        },
        uColorNumber: {
          value: this.options.uColorNumber,
        },
        uContourFrequency: {
          value: this.options.uContourFrequency,
        },
        uTerrainColor: { value: new THREE.Color(this.options.uTerrainColor) },
        uLineColor: { value: new THREE.Color(this.options.uLineColor) },
        uColorOne: {
          value: new THREE.Color(this.options.uColorOne),
        },
        uColorTwo: {
          value: new THREE.Color(this.options.uColorTwo),
        },
        uColorThree: {
          value: new THREE.Color(this.options.uColorThree),
        },
        uMaskTexture: { value: this.maskTexture },
      },
      vertexShader: wireFrameVertexShader,
      fragmentShader: wireframeFragmentShader,
      transparent: true,
    });

    if (this.debug.active) {
      this.debugFolder
        .add(this.wireFrameMaterial.uniforms.uAlpha, "value")
        .min(0)
        .max(1)
        .step(0.01)
        .name("Opacity");
      this.debugFolder
        .add(this.wireFrameMaterial.uniforms.uContourWidth, "value")
        .min(0)
        .max(3)
        .step(0.001)
        .name("Contour Width");
      this.debugFolder
        .add(this.wireFrameMaterial.uniforms.uContourFrequency, "value")
        .min(0.1)
        .max(20)
        .step(0.1)
        .name("Contour Frequency");
      this.debugFolder
        .add(this.wireFrameMaterial.uniforms.uColorNumber, "value")
        .min(1)
        .max(3)
        .step(1)
        .name("Color Number");
      this.debugFolder
        .addColor(this.options, "uColorOne")
        .name("Color One")
        .onChange(() => {
          this.wireFrameMaterial.uniforms.uColorOne.value.set(
            this.options.uColorOne
          );
        });
      this.debugFolder
        .addColor(this.options, "uColorTwo")
        .name("Color Two")
        .onChange(() => {
          this.wireFrameMaterial.uniforms.uColorTwo.value.set(
            this.options.uColorTwo
          );
        });
      this.debugFolder
        .addColor(this.options, "uColorThree")
        .name("Color Two")
        .onChange(() => {
          this.wireFrameMaterial.uniforms.uColorThree.value.set(
            this.options.uColorThree
          );
        });
      this.debugFolder
        .addColor(this.options, "uLineColor")
        .name("Line Color")
        .onChange(() => {
          this.wireFrameMaterial.uniforms.uLineColor.value.set(
            this.options.uLineColor
          );
        });
    }
  }

  setModel() {
    this.model = this.resource.scene;

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = this.wireFrameMaterial;
      }
      if (child instanceof THREE.PerspectiveCamera) {
        // this.addCameraButton(child.position, child.rotation);
      }
    });

    this.model.position.y = 0.001;
    this.scene.add(this.model);
  }

  addCameraButton(position, rotation) {
    if (this.debug.active) {
      this.debugFolder
        .add(
          {
            button: () => {
              this.camera.setPositionAndRotation(position, rotation);
              console.log(position, rotation);
            },
          },
          "button"
        )
        .name("Update Camera Angle");
    }
  }

  setDebug() {}

  update() {
    // map animation
    // this.animation.mixer.update(this.time.delta * 0.001);
  }
}
