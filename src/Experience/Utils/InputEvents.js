import * as THREE from "three";
import EventEmitter from "./EventEmitter";

export default class InputEvents extends EventEmitter {
  constructor() {
    super();

    // Setup
    this.mouse = new THREE.Vector3(0, 0, 0);
    this.touch = new THREE.Vector2(0, 0);
    this.keys = {};

    // Mouse events
    window.addEventListener("mousemove", (event) => {
      this.mouse.x = event.clientX;
      this.mouse.y = event.clientY;

      this.trigger("mousemove");
    });

    window.addEventListener("mousedown", this.handleMouseDown.bind(this));
    window.addEventListener("mouseup", this.handleMouseUp.bind(this));

    // Add touch event listeners
    window.addEventListener("touchstart", this.handleTouchStart.bind(this));
    window.addEventListener("touchmove", this.handleTouch.bind(this));

    // Mouse Wheel / Trackpad events
    window.addEventListener("wheel", this.handleWheel.bind(this));

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

  handleMouseDown() {
    this.isPressed = true;
    this.trigger("pressDown");
    document.body.style.cursor = "grabbing";
  }

  handleMouseUp() {
    this.isPressed = false;
    this.trigger("pressUp");
    document.body.style.cursor = "grab";
  }

  handleWheel(event) {
    let delta = event.deltaY || -event.wheelDelta || event.detail;
    delta = delta / (event.deltaMode === 1 ? 3 : 100);

    this.mouse.z = delta;
    this.trigger("wheel");
  }

  // Function to handle touch events and simulate wheel behavior
  handleTouch(event) {
    const delta = event.touches[0].clientY - this.touch.y;
    this.touch.y = event.touches[0].clientY;

    this.mouse.z = delta / 100; // You may need to adjust the scaling factor
    this.trigger("wheel");

    // Prevent the default touch behavior to avoid scrolling
    event.preventDefault();
  }

  // Function to handle touch start event
  handleTouchStart(event) {
    this.touch.y = event.touches[0].clientY;
  }

  isKeyDown(keyCode) {
    return this.keys[keyCode] || false;
  }
}
