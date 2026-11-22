import * as THREE from "three/webgpu";

const OCCLUSION_STEPS = 48;
const PIN_HEIGHT = 2.5;
const PIN_RADIUS = 1;

// Works like a Mapbox marker: new Marker().setLngLat([lng, lat]).addTo(map)
export default class Marker {
  constructor({
    color = 0xcb6c6a,
    // Any 3D object to show instead of the pin, with its bottom at y = 0
    object = null,
    sightLift = 0.4,
  } = {}) {
    this.options = { color, sightLift };
    this.map = null;
    this.lngLat = null;
    // Stays false until the ground under the marker has loaded
    this.grounded = false;

    this.object = object ?? this.createPin();
    this.object.visible = false;

    this.screen = { x: 0, y: 0, visible: false };
    this.projected = new THREE.Vector3();
    this.sightStart = new THREE.Vector3();
    this.sightSample = new THREE.Vector3();
  }

  // An upside down cone, its tip touches the ground
  createPin() {
    // No lights in the scene, so a basic material that shows the color as it is
    this.material = new THREE.MeshBasicNodeMaterial({
      color: this.options.color,
    });

    this.geometry = new THREE.ConeGeometry(PIN_RADIUS, PIN_HEIGHT, 16);
    this.geometry.rotateX(Math.PI);
    this.geometry.translate(0, PIN_HEIGHT / 2, 0);

    return new THREE.Mesh(this.geometry, this.material);
  }

  setLngLat(lngLat) {
    this.lngLat = lngLat;
    this.place();
    return this;
  }

  getLngLat() {
    return this.lngLat;
  }

  addTo(map) {
    this.remove();
    this.map = map;
    map.overlays.add(this);
    map.add(this.object);
    this.place();
    return this;
  }

  remove() {
    if (!this.map) return this;
    this.map.overlays.delete(this);
    this.map.remove(this.object);
    this.map = null;
    return this;
  }

  place() {
    if (!this.map || !this.lngLat) return;
    const position = this.map.lngLatToWorld(this.lngLat);
    this.object.position.x = position.x;
    this.object.position.z = position.z;
    this.update();
  }

  // Puts the marker on the ground, and hides it until that ground has loaded
  update() {
    const groundHeight = this.map.getGroundHeight(this.object.position);
    this.grounded = groundHeight !== null;
    this.object.position.y = groundHeight ?? 0;
    this.object.visible = this.grounded;
  }

  // Where the marker is on the screen in pixels (to put an HTML label there), and if it can be seen
  project(camera, width, height, maxDistance = Infinity) {
    const position = this.object.position;
    this.projected.copy(position).project(camera);

    const inFront = this.projected.z > -1 && this.projected.z < 1;
    const onScreen =
      Math.abs(this.projected.x) < 1.1 && Math.abs(this.projected.y) < 1.1;
    const near = camera.position.distanceTo(position) < maxDistance;

    this.screen.x = (this.projected.x * 0.5 + 0.5) * width;
    this.screen.y = (-this.projected.y * 0.5 + 0.5) * height;
    this.screen.visible =
      this.grounded &&
      inFront &&
      onScreen &&
      near &&
      !this.isBehindGround(camera.position);
    return this.screen;
  }

  // Goes step by step from the marker to the camera, if the ground is ever higher than that line a mountain is in the way
  isBehindGround(cameraPosition) {
    this.sightStart.copy(this.object.position);
    this.sightStart.y += this.options.sightLift;

    for (let step = 1; step < OCCLUSION_STEPS; step++) {
      this.sightSample.lerpVectors(
        this.sightStart,
        cameraPosition,
        step / OCCLUSION_STEPS,
      );
      const groundHeight = this.map.getGroundHeight(this.sightSample);
      if (groundHeight !== null && groundHeight > this.sightSample.y) {
        return true;
      }
    }
    return false;
  }

  dispose() {
    this.remove();
    this.geometry?.dispose();
    this.material?.dispose();
  }
}
