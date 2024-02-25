import "./styles/style.scss";

import messages from "./Experience/Data/i18n";
import { getNavigatorLanguage } from "./Experience/Utils/Utils.js";

import { createI18n } from "vue-i18n";
import { createApp, h } from "vue";
import App from "./App.vue";

import Experience from "./Experience/Experience.js";

const experience = new Experience(document.querySelector("canvas.webgl"));

const i18n = new createI18n({
  locale: getNavigatorLanguage(),
  messages,
  fallbackLocale: "en",
  warnHtmlInMessage: "off",
});

const app = createApp({
  render: () => h(App),
});

app.use(i18n);
app.mount("#app");
