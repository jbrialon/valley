<template>
  <div class="step">
    <span class="point"></span>
    <span class="name">{{ place.name }}</span>
  </div>
</template>

<script>
export default {
  name: "step",
  props: {
    place: { required: true, type: Object },
  },
};
</script>

<style scoped>
.step {
  position: absolute;
  top: 0;
  left: 0;
}

.point {
  position: absolute;
  top: 0;
  left: 0;
  width: 13px;
  height: 13px;
  border: 1px solid var(--ink-color);
  background: var(--accent-color);
  box-shadow: 0 1px 3px var(--ui-shadow-color);
  transform: translate(-50%, -50%) rotate(45deg);
}

.name {
  position: absolute;
  top: 0;
  left: 30px;
  font-size: 13px;
  line-height: 1;
  letter-spacing: 0.16em;
  white-space: nowrap;
  transform: translateY(-50%);
}
</style>
