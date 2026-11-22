import EventEmitter from "./EventEmitter";

export default class Time extends EventEmitter {
  constructor() {
    super();

    this.start = performance.now();
    this.current = this.start;
    this.elapsed = 0;
    this.delta = 16;

    window.requestAnimationFrame((timestamp) => {
      this.tick(timestamp);
    });
  }

  tick(timestamp) {
    this.delta = timestamp - this.current;
    this.current = timestamp;
    this.elapsed = this.current - this.start;

    this.trigger("tick");

    window.requestAnimationFrame((timestamp) => {
      this.tick(timestamp);
    });
  }
}
