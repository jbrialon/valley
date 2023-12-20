import * as THREE from "three";

export default {
  top: {
    // default position
    position: new THREE.Vector3(15.2, 6.9, -3.9),
    rotation: new THREE.Vector3(-120, 0, 0),
    target: new THREE.Vector3(15.3, 7.3, -3.85),
    animate: false,
  },
  day1: {
    position: new THREE.Vector3(-6.4, 4.6, -6.3),
    rotation: new THREE.Vector3(-0.43, -0.13, -0.06),
    target: new THREE.Vector3(0.5, 1.7, -8.3),
    animate: true,
  },
  day2: {
    position: new THREE.Vector3(3.11, 6.44, -8.85),
    rotation: new THREE.Vector3(-0.6, -0.6, -0.4),
    target: new THREE.Vector3(8, 4.7, -11),
    animate: true,
  },
  day3: {
    position: new THREE.Vector3(13.5, 4.5, -15),
    rotation: new THREE.Vector3(-1.4, -1.2, -1.4),
    target: new THREE.Vector3(25, 7, -15),
    animate: true,
  },
  day4: {
    position: new THREE.Vector3(21.5, 7.5, -8),
    rotation: new THREE.Vector3(-0.2, 0.12, 0.034),
    target: new THREE.Vector3(25, 7, -15),
    animate: true,
  },
  day7: {
    position: new THREE.Vector3(-4.4, 5.5, 1.2),
    rotation: new THREE.Vector3(-0.2, 0.12, 0.034),
    target: new THREE.Vector3(-2.2, 4.6, -0.9),
    animate: true,
  },
  day8: {
    position: new THREE.Vector3(11.9, 6.7, 9.3),
    rotation: new THREE.Vector3(-0.2, 0.12, 0.034),
    target: new THREE.Vector3(6.29, 2.0, 2.2),
    // position: new THREE.Vector3(7.7, 6.5, 7.6),
    // rotation: new THREE.Vector3(-0.2, 0.12, 0.034),
    // target: new THREE.Vector3(9.2, 3.8, 4),
    animate: true,
  },
};
