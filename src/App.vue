<template>
  <markers :manager="manager"></markers>
  <top
    title="Valley"
    subtitle="An explorative experiment (press F to Explore)"
  ></top>
</template>

<script>
import markers from "./components/markers/markers.vue";
import top from "./components/top.vue";

import Experience from "./Experience/Experience.js";

export default {
  name: "App",
  components: { markers, top },
  created() {
    this.manager = new Experience().manager;
  },
};
</script>
