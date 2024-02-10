<script setup>
// Vue Components
import ui from "./components/ui.vue";

// Three.js app
import Experience from "./Experience/Experience";
const experience = new Experience();
const manager = experience.manager;
</script>

<template>
  <div id="app">
    <ui :manager="manager"></ui>
  </div>
</template>

<style lang="scss">
#app {
  position: relative;
  width: 100vw;
  height: var(--vh);
}
</style>
