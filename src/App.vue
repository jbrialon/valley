<script setup>
// Vue Components
import top from "./components/top.vue";
import ui from "./components/ui.vue";
import infowindow from "./components/infowindow.vue";
import log from "./components/log.vue";
import timeline from "./components/timeline.vue";

// Three.js app
import Experience from "./Experience/Experience";
const experience = new Experience();
const manager = experience.manager;
</script>

<template>
  <top :manager="manager"></top>
  <ui :manager="manager"></ui>
  <infowindow :manager="manager"></infowindow>
  <log :manager="manager"></log>
  <timeline :manager="manager"></timeline>
</template>

<style lang="scss">
#app {
  position: relative;
  width: 100vw;
  height: var(--vh);

  &:before,
  &:after {
    pointer-events: none;
    display: none;
    content: "";
    position: absolute;
    z-index: $z-disclaimer;

    @include portrait {
      display: block;
    }
  }

  &:before {
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: var(--main-bg-color);
  }

  &:after {
    bottom: 0;
    left: 0;
    font-weight: 500;
    font-size: 15vw;
    content: "This is a Desktop Experiment. (for\00a0now)";
    color: white;
    max-width: 25vw;
  }
}
</style>
