import * as THREE from "three";

const chapterOne = [
  {
    order: 1,
    name: "syabru_besi",
    displayName: "Syabru Besi",
    position: new THREE.Vector3(-4.29, 1.56, -9.07),
    type: "main",
    day: [1],
    photos: [],
  },
  {
    order: 2,
    name: "pairo",
    displayName: "Pairo",
    position: new THREE.Vector3(0.08, 1.88, -7.69),
    overlayRadius: 3,
    type: "secondary",
    day: [1],
    photos: ["/photos/photo-1.jpg"],
  },
  {
    order: 3,
    name: "bamboo",
    displayName: "Bamboo",
    position: new THREE.Vector3(2.17, 2.34, -7.96),
    type: "secondary",
    day: [1],
    photos: ["/photos/photo-2.jpg"],
  },
  {
    order: 4,
    name: "lama_hotel",
    displayName: "Lama Hotel",
    position: new THREE.Vector3(5.7, 2.65, -8.74),
    type: "main",
    day: [1],
    photos: ["/photos/photo-3.jpg"],
  },
  {
    order: 5,
    name: "langtang",
    displayName: "Langtang",
    position: new THREE.Vector3(15.63, 3.62, -15.48),
    type: "main",
    day: [2],
    photos: ["/photos/photo-4.jpg"],
  },
  {
    order: 6,
    name: "kyanjin_gompa",
    displayName: "Kyanjin Gompa",
    position: new THREE.Vector3(20.67, 4, -15.35),
    type: "main",
    day: [3],
    photos: [],
  },
];

// Acclimatation
const chapterTwo = [
  {
    order: 1,
    name: "Kkyanjin_ri",
    displayName: "Kyanjin Ri",
    position: new THREE.Vector3(21.39, 4.39, -15.85),
    type: "mountain",
    day: [3],
    photos: ["/photos/photo-5.jpg", "/photos/photo-6.jpg"],
  },
  {
    order: 2,
    name: "tserko_ri",
    displayName: "Tserko Ri",
    position: new THREE.Vector3(24.69, 5.14, -15.29),
    type: "mountain",
    day: [4],
    photos: [],
  },
];

const chapterTree = [
  // Re-langtang et kyanjin_gompa sans doute
  {
    order: 0, //todo
    name: "thulo_syabru",
    displayName: "Thulo Syabru",
    position: new THREE.Vector3(-2.1, 2.29, -6.49),
    overlayPosition: new THREE.Vector2(0.0783, 0.2989),
    overlayRadius: 3,
    day: [5],
    type: "main",
  },
  {
    order: 0, //todo
    name: "sing_gomba",
    displayName: "Sing_Gomba",
    position: new THREE.Vector3(-4.36, 3.37, -2.28),
    type: "main",
  },
  {
    order: 0, //todo
    name: "gosaikunda",
    displayName: "Gosaikunda",
    position: new THREE.Vector3(3.33, 4.41, 1.24),
    type: "main",
  },
  {
    order: 0, //todo
    name: "laurebina",
    displayName: "Laurebina",
    position: new THREE.Vector3(5.37, 4.72, 2.31),
    type: "secondary",
  },
  {
    order: 0, //todo
    name: "gopte",
    displayName: "Gopte",
    position: new THREE.Vector3(11.3, 3.41, 7.45),
    type: "main",
  },
];

const bonus = [
  {
    order: null,
    name: "kyanjin_gompa_cheese_factory",
    displayName: "Kyanjin Gompa Cheese Factory",
    position: new THREE.Vector3(20.86, 3.97, -14.75),
    type: "poi",
    day: [],
    photos: ["/photos/photo-7.jpg"],
  },
];

export default {
  chapterOne,
  chapterTwo,
  chapterTree,
  bonus,
};
