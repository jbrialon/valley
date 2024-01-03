import * as THREE from "three";
import { gsap } from "gsap";
import Experience from "../Experience";

export default class Tutorial {
  constructor() {
    this.experience = new Experience();
    this.manager = this.experience.manager;
    this.debug = this.experience.debug;

    // Setup
    this.tutorial = document.querySelector(".js-tutorial");
    this.currentStep = 1;
    this.steps = this.tutorial.querySelectorAll(".js-steps");

    gsap.set(this.steps[1], {
      autoAlpha: 0,
    });
    gsap.set(this.steps[2], {
      autoAlpha: 0,
    });
    this.initEvents();

    // Debug
    // this.setDebug();
  }

  initEvents() {
    this.manager.on("loaded", () => {
      gsap.to(this.tutorial, {
        autoAlpha: 1,
        duration: 1,
        ease: "power4.inOut",
      });
    });

    this.manager.on("onScrollStart", () => {
      gsap.to(this.steps[0], {
        autoAlpha: 0,
        duration: 1,
        ease: "power4.inOut",
      });

      gsap.to(this.steps[1], {
        autoAlpha: 1,
        duration: 1,
        delay: 1,
        ease: "power4.inOut",
      });
      this.currentStep = 2;
    });

    this.manager.on("onMarkerHover", (name) => {
      if (this.currentStep === 2) {
        gsap.to(this.steps[1], {
          autoAlpha: 0,
          duration: 1,
          ease: "power4.inOut",
        });

        gsap.to(this.steps[2], {
          autoAlpha: 1,
          duration: 1,
          delay: 1,
          ease: "power4.inOut",
        });
        this.currentStep = 3;
      }
    });

    this.manager.on("onMarkerClick", (name) => {
      if (this.currentStep === 3) {
        gsap.to(this.tutorial, {
          autoAlpha: 0,
          duration: 1,
          ease: "power4.inOut",
        });
      }
    });
  }

  setDebug() {}
}
