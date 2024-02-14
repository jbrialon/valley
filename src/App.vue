<script setup>
// Vue Components
import ui from "./components/ui.vue";
import infowindow from "./components/infowindow.vue";

// Three.js app
import Experience from "./Experience/Experience";
const experience = new Experience();
const manager = experience.manager;
</script>

<template>
  <div id="app">
    <ui :manager="manager"></ui>
    <infowindow :manager="manager"></infowindow>
  </div>
</template>

<style lang="scss">
#app {
  position: relative;
  width: 100vw;
  height: var(--vh);
}
</style>
