import "./styles/style.css";

import { createApp } from "vue";
import App from "./App.vue";

import Experience from "./Experience/Experience.js";

const experience = new Experience({
  targetElement: document.querySelector(".experience"),
  canvas: document.querySelector("canvas.webgl"),
});

createApp(App).mount("#app");
