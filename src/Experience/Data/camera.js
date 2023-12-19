import * as THREE from "three";

export default {
  top: {
    // default position
    position: new THREE.Vector3(16.6, 13.8, -3.9),
    rotation: new THREE.Vector3(-120, 0, 0),
    target: new THREE.Vector3(0, 0, 0),
    animate: false,
  },
  day7: {
    position: new THREE.Vector3(-4.4, 5.5, 1.2),
    rotation: new THREE.Vector3(-0.2, 0.12, 0.034),
    target: new THREE.Vector3(-2.2, 4.6, -0.9),
    animate: true,
  },
  day4: {
    position: new THREE.Vector3(21.5, 7.5, -8),
    rotation: new THREE.Vector3(-0.2, 0.12, 0.034),
    target: new THREE.Vector3(25, 7, -15),
    animate: true,
  },
  day3: {
    position: new THREE.Vector3(13.5, 4.5, -15),
    rotation: new THREE.Vector3(-1.4, -1.2, -1.4),
    target: new THREE.Vector3(25, 7, -15),
    animate: true,
  },
  day2: {
    position: new THREE.Vector3(3.11, 6.44, -8.85),
    rotation: new THREE.Vector3(-0.6, -0.6, -0.4),
    target: new THREE.Vector3(8, 4.7, -11),
    animate: true,
  },
  day1: {
    position: new THREE.Vector3(0.09, 6, -2),
    rotation: new THREE.Vector3(-0.43, -0.13, -0.06),
    target: new THREE.Vector3(1, 4.7, -5.7),
    animate: true,
  },
};
