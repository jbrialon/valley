import * as THREE from "three";
import EventEmitter from "./EventEmitter";

export default class MouseEvents extends EventEmitter {
  constructor() {
    super();

    // Setup
    this.mouse = new THREE.Vector3(0, 0, 0);

    window.addEventListener("mousemove", (event) => {
      this.mouse.x = event.clientX;
      this.mouse.y = event.clientY;

      this.trigger("mousemove");
    });

    window.addEventListener("wheel", (event) => {
      this.mouse.z = event.deltaY;

      this.trigger("wheel");
    });
  }
}
