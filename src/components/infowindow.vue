<template>
  <div>
    <Transition name="fade">
      <div
        class="infowindow"
        v-if="show"
        :style="infoWindowPosition"
        @click="selectMarker()"
      >
        <div class="infowindow--inner" @mouseout="hideInfowindow()">
          <div class="infowindow--content">{{ activeMarker.displayName }}</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { markersArray } from "../Experience/Data/markers.js";

export default {
  name: "infowindow",
  props: {
    manager: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      show: false,
      position: {
        x: 0,
        y: 0,
      },
    };
  },
  methods: {
    selectMarker() {
      if (!this.manager.setZoomState(true)) {
        const displayName = this.activeMarker.displayName;
        this.manager.setZoomState(true);
        this.manager.trigger("camera-zoom");
        this.manager.trigger("ui-step-show", displayName);
        this.show = false;
      }
    },
    hideInfowindow() {
      this.manager.trigger("marker-mouseout");
      this.show = false;
    },
  },
  computed: {
    infoWindowPosition() {
      return {
        transform: `translate(${this.position.x}px, ${this.position.y}px)`,
      };
    },
  },
  mounted() {
    this.manager.on("infowindow-show", (index) => {
      this.show = true;
      this.activeMarker = markersArray[index];
    });

    this.manager.on("infowindow-hide", () => {
      this.show = false;
      this.activeMarker = null;
    });

    this.manager.on("infowindow-update-position", (position) => {
      if (this.show) {
        this.position = position;
      }
    });
  },
};
</script>

<style lang="scss" scoped>
.infowindow {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: $z-ui;

  &--inner {
    position: relative;
    left: -50%;
    bottom: 100px;
    padding-bottom: 100px;
    cursor: pointer;
  }

  &--content {
    position: relative;
    font-weight: 500;
    letter-spacing: 1px;
    color: var(--secondary-text-color);
    padding: 6px 12px;
    background: var(--secondary-bg-color);
    box-shadow: 4px 4px 0px 1px var(--secondary-text-color);
  }
}
</style>
