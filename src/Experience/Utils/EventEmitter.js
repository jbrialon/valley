export default class EventEmitter extends EventTarget {
  constructor() {
    super();
  }

  on(eventName, callback) {
    // Errors
    if (typeof eventName === "undefined" || eventName === "") {
      console.warn("wrong eventName");
      return false;
    }

    if (typeof callback === "undefined") {
      console.warn("wrong callback");
      return false;
    }

    // Wrap the callback to directly apply eventData as arguments
    const wrappedCallback = (event) => {
      callback(...event.detail);
    };

    // Store the wrapped callback to enable removal later
    if (!this._callbacks) {
      this._callbacks = new Map();
    }

    let callbacksForEvent = this._callbacks.get(eventName);
    if (!callbacksForEvent) {
      callbacksForEvent = new Map();
      this._callbacks.set(eventName, callbacksForEvent);
    }

    // Associate the original callback with its wrapper
    callbacksForEvent.set(callback, wrappedCallback);

    this.addEventListener(eventName, wrappedCallback);
    return this;
  }

  off(eventName, callback) {
    // Errors
    if (typeof eventName === "undefined" || eventName === "") {
      console.warn("wrong eventName");
      return false;
    }

    // Retrieve and remove the wrapped callback
    const callbacksForEvent = this._callbacks?.get(eventName);
    const wrappedCallback = callbacksForEvent?.get(callback);

    if (wrappedCallback) {
      this.removeEventListener(eventName, wrappedCallback);
      callbacksForEvent.delete(callback);
      if (callbacksForEvent.size === 0) {
        this._callbacks.delete(eventName);
      }
    }

    return this;
  }

  trigger(eventName, ...eventData) {
    // Errors
    if (typeof eventName === "undefined" || eventName === "") {
      console.warn("wrong eventName");
      return false;
    }

    const event = new CustomEvent(eventName, { detail: eventData });
    this.dispatchEvent(event);
    return this;
  }
}
