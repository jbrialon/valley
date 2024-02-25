import * as THREE from "three";
import EventEmitter from "./EventEmitter";

import { throttle } from "./Utils";

export default class InputEvents extends EventEmitter {
  constructor() {
    super();

    // Setup
    this.mouse = new THREE.Vector3(0, 0, 0);
    this.touch = new THREE.Vector2(0, 0);
    this.deviceOrientation = new THREE.Vector3(0, 0, 0);
    this.direction = "";
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
    window.addEventListener("touchend", this.handleTouchEnd.bind(this));

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

  requestPermission() {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response == "granted") {
            // Throttle the handleOrientation handler to limit calls to once every 100ms
            const throttledDeviceOrientationHandler = throttle(
              this.handleOrientation.bind(this),
              100
            );

            // Add event listener for device orientation
            window.addEventListener(
              "deviceorientation",
              throttledDeviceOrientationHandler,
              true
            );
          }
        })
        .catch(console.error);
    }
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

    // Determine the scroll direction
    this.direction = delta > 0 ? "backward" : "forward";

    this.mouse.z = delta;
    this.trigger("wheel");
  }

  handleTouchStart(event) {
    // if only one touch, we act as simple mouse click
    if (event.touches.length === 1) {
      this.isPressed = true;
      this.trigger("pressDown");
      // if two touch it's not mouse click, we act as a scroll
    } else if (event.touches.length === 2) {
      this.isPressed = false;
      this.trigger("pressUp");
    }
    this.touch.y = event.touches[0].clientY;
  }

  handleTouch(event) {
    // if only one touch, we act as simple mouse move
    if (event.touches.length === 1) {
      this.mouse.x = event.touches[0].clientX;
      this.mouse.y = event.touches[0].clientY;
      this.trigger("mousemove");

      // if two touches, we act as a mouse scroll
    } else if (event.touches.length === 2) {
      // Calculate the average change in position of the two touches to simulate a delta
      const delta =
        (event.touches[0].clientY + event.touches[1].clientY) / 2 -
        this.touch.y;
      this.touch.y = (event.touches[0].clientY + event.touches[1].clientY) / 2;

      // Adjust this.mouse.z based on the delta, 100 as scaling factor for mobile
      this.mouse.z = delta / 100;

      // Determine the scroll direction
      this.direction = delta > 0 ? "backward" : "forward";

      // Trigger the custom 'wheel' event or equivalent functionality
      this.trigger("wheel");
    }
    // Prevent the default touch behavior to avoid scrolling and pinch-zoom actions
    event.preventDefault();
  }

  handleTouchEnd(event) {
    if (event.touches.length === 0) {
      this.isPressed = false;
      this.trigger("pressUp");
    }
  }

  handleOrientation(event) {
    const { beta } = event; // Get the beta value (device's rotation around the x axis)
    this.deviceOrientation.x = beta;
    // this.deviceOrientation.y = gamma;

    this.trigger("deviceOrientation");
  }

  isKeyDown(keyCode) {
    return this.keys[keyCode] || false;
  }
}
