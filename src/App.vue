<script setup>
import ui from "./components/ui.vue";
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
  height: 100vh;

  @supports (-webkit-touch-callout: none) {
    #app {
      /* The hack for Safari */
      min-height: -webkit-fill-available;
    }
  }
}
</style>
