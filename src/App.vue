<template>
  <markers :manager="manager"></markers>
  <top title="Valley" subtitle="An explorative experiment"></top>
  <bottom></bottom>
</template>

<script>
import markers from "./components/markers/markers.vue";
import top from "./components/top.vue";
import bottom from "./components/bottom.vue";

import Experience from "./Experience/Experience.js";

export default {
  name: "App",
  components: { markers, top, bottom },
  created() {
    this.manager = new Experience().manager;
  },
};
</script>
