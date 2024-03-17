import * as THREE from "three";

export const chapterOne = [
  {
    order: 1,
    name: "syabru_besi",
    displayName: "Syabru Besi",
    position: new THREE.Vector3(-4.29, 1.56, -9.07),
    type: "main",
    day: [1],
    altitude: "1400m",
    photo: "",
    orientation: "",
  },
  {
    order: 2,
    name: "pairo",
    displayName: "Pairo",
    position: new THREE.Vector3(0.08, 1.89, -7.57),
    type: "secondary",
    day: [1],
    altitude: "1600m",
    photo: "/photos/photo-1.jpg",
    orientation: "landscape",
  },
  {
    order: 3,
    name: "bamboo",
    displayName: "Bamboo",
    position: new THREE.Vector3(2.24, 2.26, -8.03),
    type: "secondary",
    day: [1],
    altitude: "2000m",
    photo: "/photos/photo-2.jpg",
    orientation: "landscape",
  },
  {
    order: 4,
    name: "lama_hotel",
    displayName: "Lama Hotel",
    position: new THREE.Vector3(5.7, 2.65, -8.74),
    type: "main",
    day: [2],
    altitude: "2500m",
    photo: "/photos/photo-3.jpg",
    orientation: "portrait",
  },

  {
    order: 5,
    name: "langtang",
    displayName: "Langtang",
    position: new THREE.Vector3(15.63, 3.62, -15.48),
    type: "main",
    day: [3],
    altitude: "3400m",
    photo: "/photos/photo-4.jpg",
    orientation: "portrait",
  },
  {
    order: 6,
    name: "kyanjin_gompa",
    displayName: "Kyanjin Gompa",
    position: new THREE.Vector3(20.67, 4, -15.35),
    type: "main",
    day: [4],
    altitude: "3800m",
    photo: "",
    orientation: "landscape",
  },
];

// Acclimatation
export const chapterTwo = [
  {
    order: 1,
    name: "Kkyanjin_ri",
    displayName: "Kyanjin Ri",
    position: new THREE.Vector3(21.39, 4.39, -15.85),
    type: "mountain",
    day: [4],
    altitude: "4310m",
    photo: "/photos/photo-6.jpg",
    orientation: "portrait",
  },
  {
    order: 2,
    name: "tserko_ri",
    displayName: "Tserko Ri",
    position: new THREE.Vector3(24.69, 5.14, -15.29),
    type: "mountain",
    altitude: "4900m",
    day: [5],
    photo: "/photos/photo-5.jpg",
    orientation: "landscape",
  },
];

export const chapterTree = [
  // Re-langtang et kyanjin_gompa sans doute
  {
    order: 0, //todo
    name: "thulo_syabru",
    displayName: "Thulo Syabru",
    position: new THREE.Vector3(-2.1, 2.29, -6.49),
    overlayPosition: new THREE.Vector2(0.0783, 0.2989),
    overlayRadius: 3,
    day: [6],
    type: "main",
  },
  {
    order: 0, //todo
    name: "sing_gomba",
    displayName: "Sing_Gomba",
    position: new THREE.Vector3(-4.36, 3.37, -2.28),
    day: [7],
    type: "main",
  },
  {
    order: 0, //todo
    name: "gosaikunda",
    displayName: "Gosaikunda",
    position: new THREE.Vector3(3.33, 4.41, 1.24),
    day: [8],
    type: "main",
  },
  {
    order: 0, //todo
    name: "laurebina",
    displayName: "Laurebina",
    position: new THREE.Vector3(5.37, 4.72, 2.31),
    day: [9],
    type: "main",
  },
  {
    order: 0, //todo
    name: "gopte",
    displayName: "Gopte",
    position: new THREE.Vector3(11.3, 3.41, 7.45),
    day: [10],
    type: "main",
  },
  {
    order: 0, //todo
    name: "kutumsang",
    displayName: "Kutumsang",
    position: new THREE.Vector3(11.3, 3.41, 7.45),
    day: [11],
    type: "main",
  },
  {
    order: 0, //todo
    name: "chisopani",
    displayName: "Chisopani",
    position: new THREE.Vector3(11.3, 3.41, 7.45),
    day: [12],
    type: "main",
  },
  {
    order: 0, //todo
    name: "sundarijal",
    displayName: "Sundarijal",
    position: new THREE.Vector3(11.3, 3.41, 7.45),
    day: [13],
    type: "main",
  },
];

export const bonus = [
  {
    order: null,
    name: "langtang_river",
    displayName: "Langtang River",
    position: new THREE.Vector3(7.77, 2.91, -12.57),
    chapter: "chapterOne",
    type: "poi",
    day: [],
    photos: ["/photos/photo-3.jpg"],
  },
  {
    order: null,
    name: "kyanjin_gompa_cheese_factory",
    displayName: "Cheese Factory",
    position: new THREE.Vector3(20.86, 3.97, -14.75),
    type: "poi",
    chapter: "chapterOne",
    day: [],
    photos: ["/photos/photo-7.jpg"],
  },
  {
    order: 3,
    name: "yoga_caro",
    displayName: "",
    position: new THREE.Vector3(25.05, 4.33, -13.75),
    type: "mountain",
    chapter: "chapterTwo",
    altitude: "?",
    day: [4],
    photos: [],
  },
];

// export all markers per chapter
export const markers = {
  chapterOne,
  chapterTwo,
  chapterTree,
  bonus,
};

// export all markers as array
export const markersArray = Object.values(markers).flat();
