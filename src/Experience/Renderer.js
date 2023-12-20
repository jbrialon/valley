import * as THREE from "three";
import Experience from "./Experience";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";

import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

export default class Renderer {
  constructor() {
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;

    // Options
    this.options = {
      clearColor: "#968677",
    };

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("World");
      this.debugFolder.close();
      this.debugFolder
        .addColor(this.options, "clearColor")
        .name("Background Color")
        .onChange(() => {
          this.instance.setClearColor(this.options.clearColor);
        });
    }

    this.setInstance();
  }

  setInstance() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance",
    });

    // TODO: try to understand that
    THREE.ColorManagement.enabled = false;
    // discourse.threejs.org/t/updates-to-color-management-in-three-js-r152/50791
    // this.instance.outputColorSpace = THREE.SRGBColorSpace;
    // this.instance.outputColorSpace = THREE.LinearSRGBColorSpace;
    // this.instance.shadowMap.enabled = true;
    // this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(this.options.clearColor);

    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(this.sizes.pixelRatio);

    /**
     * Post processing
     */
    this.depthTexture = new THREE.DepthTexture();

    this.renderTarget = new THREE.WebGLRenderTarget(800, 600, {
      samples: this.sizes.pixelRatio === 1 ? 2 : 0,
      depthTexture: this.depthTexture,
      depthBuffer: true,
    });

    this.effectComposer = new EffectComposer(this.renderer, this.renderTarget);
    this.effectComposer.setSize(this.sizes.width, this.sizes.height);
    this.effectComposer.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));

    // Render Pass
    this.renderPass = new RenderPass(this.scene, this.camera.instance);
    this.effectComposer.addPass(this.renderPass);

    // Antialias Pass.
    this.effectFXAA = new ShaderPass(FXAAShader);
    this.effectFXAA.uniforms["resolution"].value.set(
      1 / this.sizes.width,
      1 / this.sizes.height
    );
    this.effectComposer.addPass(this.effectFXAA);

    // this.smaaPass = new SMAAPass();
    // this.smaaPass.enabled =
    //   this.renderer.getPixelRatio() === 1 &&
    //   this.renderer.capabilities.isWebGL2;
    // this.effectComposer.addPass(this.smaaPass);
  }

  resize() {
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));

    // Update effect composer
    this.effectComposer.setSize(this.sizes.width, this.sizes.height);
    this.effectComposer.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));

    this.effectFXAA.setSize(this.sizes.width, this.sizes.height);
    this.effectFXAA.uniforms["resolution"].value.set(
      1 / this.sizes.width,
      1 / this.sizes.height
    );
  }

  update() {
    this.effectComposer.render();
    //this.renderer.render(this.scene, this.camera.instance);
  }
}
