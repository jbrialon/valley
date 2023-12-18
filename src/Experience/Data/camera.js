import * as THREE from "three";

export default {
  top: {
    // default position
    position: new THREE.Vector3(0, 26, 0),
    rotation: new THREE.Vector3(0, -90, 0),
    target: new THREE.Vector3(0, 0, 0),
  },
  Camera: {
    // day One
    position: new THREE.Vector3(21.5, 7.5, -8),
    rotation: new THREE.Vector3(-0.2, 0.12, 0.034),
    target: new THREE.Vector3(25, 7, -15),
  },
  Camera001_1: {
    // day Two
    position: new THREE.Vector3(3.9, 3.3, -7.4),
    rotation: new THREE.Vector3(0.016, -0.84, -0.014),
    target: new THREE.Vector3(5, 4, -8.3),
  },
  Camera002: {
    // day Three
    position: new THREE.Vector3(5.7, 4.8, -12.8),
    rotation: new THREE.Vector3(-0.95, -1.35, -0.94),
    target: new THREE.Vector3(7, 5.5, -12.9),
  },
};
