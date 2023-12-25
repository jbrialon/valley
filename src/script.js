import gsap from "gsap";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import Experience from "./Experience/Experience.js";

gsap.registerPlugin(MotionPathPlugin);

const experience = new Experience(document.querySelector("canvas.webgl"));
