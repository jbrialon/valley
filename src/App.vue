<script setup>
// Vue Components
import loader from "./components/loader.vue";
import ui from "./components/ui.vue";
import infowindow from "./components/infowindow.vue";
import log from "./components/log.vue";

// Three.js app
import Experience from "./Experience/Experience";
const experience = new Experience();
const manager = experience.manager;
</script>

<template>
  <loader :manager="manager"></loader>
  <ui :manager="manager"></ui>
  <infowindow :manager="manager"></infowindow>
  <log :manager="manager"></log>
</template>

<style lang="scss">
#app {
  position: relative;
  width: 100vw;
  height: var(--vh);
}
</style>
