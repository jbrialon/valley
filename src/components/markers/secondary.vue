<template>
  <div class="secondary">
    <span class="point"></span>
  </div>
</template>

<script>
export default {
  name: "secondary",
  props: {
    place: { required: true, type: Object },
  },
};
</script>

<style scoped>
.secondary {
  position: absolute;
  top: 0;
  left: 0;
}

.point {
  position: absolute;
  top: 0;
  left: 0;
  width: 15px;
  height: 15px;
  border: 1px solid var(--ink-color);
  background: var(--secondary-color);
  transform: translate(-50%, -50%);
}
</style>
