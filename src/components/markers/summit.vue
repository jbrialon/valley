<template>
  <div class="summit">
    <svg class="point" viewBox="0 0 18 15">
      <path d="M9 0.8 L17.2 14.3 H0.8 Z"></path>
    </svg>
    <span v-if="place.altitude" class="altitude">{{ place.altitude }}</span>
  </div>
</template>

<script>
export default {
  name: "summit",
  props: {
    place: { required: true, type: Object },
  },
};
</script>

<style scoped>
.summit {
  position: absolute;
  top: 0;
  left: 0;
}

.point {
  position: absolute;
  bottom: 0;
  left: 0;
  display: block;
  width: 21px;
  aspect-ratio: 18 / 15;
  overflow: visible;
  transform: translateX(-50%);

  path {
    fill: var(--summit-color);
    stroke: var(--ink-color);
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
  }
}

.altitude {
  position: absolute;
  top: 8px;
  left: 0;
  font-size: 14px;
  font-style: italic;
  line-height: 1;
  letter-spacing: 0.08em;
  white-space: nowrap;
  transform: translateX(-50%);
}
</style>
