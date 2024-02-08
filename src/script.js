import "./styles/style.scss";
import { createApp } from "vue";
import App from "./App.vue";

import Experience from "./Experience/Experience.js";

const experience = new Experience(document.querySelector("canvas.webgl"));

createApp(App).mount("#app");
