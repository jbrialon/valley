import * as THREE from "three/webgpu";

import Experience from "../Experience";
import { Marker } from "../../TerrainMap/index.js";
import places from "../../data/places.js";

export default class Markers {
  constructor({ terrainMap, sky }) {
    this.experience = new Experience();
    this.camera = this.experience.camera;
    this.sizes = this.experience.sizes;
    this.manager = this.experience.manager;
    this.terrainMap = terrainMap;
    this.sky = sky;

    this.items = [];
    this.screens = [];
    // What things looked like last time we placed the markers
    this.previous = {
      cameraMatrix: new THREE.Matrix4(),
      heightsVersion: -1,
      maxDistance: null,
      width: 0,
      height: 0,
    };

    // Setup
    this.setMarkers();
  }

  // Empty anchors, the visible part is the HTML drawn by markers.vue
  setMarkers() {
    for (const { id, lngLat } of places) {
      const marker = new Marker({ object: new THREE.Object3D() })
        .setLngLat(lngLat)
        .addTo(this.terrainMap);
      marker.object.name = id;
      this.items.push(marker);
    }
  }

  // Markers past the fog are hidden, nothing to see there if there is no ground
  getMaxDistance() {
    return this.sky.options.fogEnd;
  }

  // The markers only move if the camera moved, the ground changed, the fog moved or the window was resized
  hasSomethingChanged() {
    const camera = this.camera.instance;
    const previous = this.previous;

    const cameraMoved = !camera.matrixWorld.equals(previous.cameraMatrix);
    const groundChanged =
      this.terrainMap.heightsVersion !== previous.heightsVersion;
    const fogMoved = this.getMaxDistance() !== previous.maxDistance;
    const windowResized =
      this.sizes.width !== previous.width ||
      this.sizes.height !== previous.height;

    return cameraMoved || groundChanged || fogMoved || windowResized;
  }

  // Saved so next frame can tell if something changed
  rememberCurrentState() {
    const previous = this.previous;
    previous.cameraMatrix.copy(this.camera.instance.matrixWorld);
    previous.heightsVersion = this.terrainMap.heightsVersion;
    previous.maxDistance = this.getMaxDistance();
    previous.width = this.sizes.width;
    previous.height = this.sizes.height;
  }

  // Finds where each marker is on the screen, then tells the Vue markers
  placeMarkers() {
    for (let index = 0; index < this.items.length; index++) {
      this.screens[index] = this.items[index].project(
        this.camera.instance,
        this.sizes.width,
        this.sizes.height,
        this.getMaxDistance(),
      );
    }
    this.manager.trigger("markers-move", this.screens);
  }

  update() {
    // The camera moved before this, but three.js only updates its matrix when it draws, so we do it now
    this.camera.instance.updateMatrixWorld();

    // Placing markers is a lot of work, so it's skipped when they would land in the same spot
    if (!this.hasSomethingChanged()) return;

    this.rememberCurrentState();
    this.placeMarkers();
  }

  destroy() {
    for (const marker of this.items) marker.dispose();
    this.items = [];
    this.screens = [];
  }
}
