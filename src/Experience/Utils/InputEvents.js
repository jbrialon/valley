import * as THREE from "three";
import EventEmitter from "./EventEmitter";

export default class InputEvents extends EventEmitter {
  constructor() {
    super();

    // Setup
    this.mouse = new THREE.Vector3(0, 0, 0);
    this.keys = {};

    // Mouse events
    window.addEventListener("mousemove", (event) => {
      this.mouse.x = event.clientX;
      this.mouse.y = event.clientY;

      this.trigger("mousemove");
    });

    window.addEventListener("wheel", (event) => {
      this.mouse.z = event.deltaY;
      this.trigger("wheel");
    });

    // Keyboard events
    window.addEventListener("keydown", (event) => {
      this.keys[event.code] = true;
      this.trigger("keydown", event.code);
    });

    window.addEventListener("keyup", (event) => {
      this.keys[event.code] = false;
      this.trigger("keyup", event.code);
    });
  }

  isKeyDown(keyCode) {
    return this.keys[keyCode] || false;
  }
}
