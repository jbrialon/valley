<template>
  <div class="markers">
    <div
      v-for="(place, index) in places"
      :key="place.name"
      class="marker"
      :class="[place.type, { 'is-visible': screens[index].visible }]"
      :style="{
        transform: `translate3d(${screens[index].x}px, ${screens[index].y}px, 0)`,
      }"
    >
      <span class="stem"></span>
      <div class="lifted">
        <component :is="place.type" :place="place"></component>
      </div>
    </div>
  </div>
</template>

<script>
import places from "../../data/places.js";
import secondary from "./secondary.vue";
import step from "./step.vue";
import summit from "./summit.vue";

export default {
  name: "markers",
  components: { secondary, step, summit },
  props: {
    manager: { required: true, type: Object },
  },
  data() {
    return {
      places,
      // Where each marker is on the screen, in pixels
      screens: places.map(() => ({ x: 0, y: 0, visible: false })),
    };
  },
  methods: {
    onMarkersMove(screens) {
      screens.forEach(({ x, y, visible }, index) => {
        const screen = this.screens[index];
        if (!screen) return;

        // A hidden marker stays where it was, so it fades out in place
        // TODO: does not always work 
        if (visible) {
          screen.x = Math.round(x);
          screen.y = Math.round(y);
        }
        screen.visible = visible;
      });
    },
  },
  mounted() {
    this.manager.on("markers-move", this.onMarkersMove);
  },
  beforeUnmount() {
    this.manager.off("markers-move", this.onMarkersMove);
  },
};
</script>

<style scoped>
.markers {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: var(--z-markers);
  font-family: var(--font-mono);
  color: var(--ui-text-color);
  text-transform: uppercase;
  text-shadow:
    0 1px 2px var(--ui-shadow-color),
    0 0 8px var(--ui-scrim-color);
}

.marker {
  --lift: 40px;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 300ms ease-in-out;
  will-change: transform, opacity;

  &.is-visible {
    opacity: 1;
  }

  &.summit {
    --lift: 10px;

    .stem {
      display: none;
    }
  }

  &.secondary {
    --lift: 28px;
  }
}

.stem {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 1px;
  height: var(--lift);
  background: var(--ui-text-color);
  box-shadow: 0 1px 2px var(--ui-shadow-color);
  opacity: 0.7;
  transform: translateX(-50%);

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--ui-text-color);
    transform: translate(-50%, 50%);
  }
}

.lifted {
  position: absolute;
  top: calc(var(--lift) * -1);
  left: 0;
}
</style>
