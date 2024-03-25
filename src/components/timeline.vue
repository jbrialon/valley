<template>
  <Transition name="slide-fade">
    <div class="timeline" v-if="show">
      <ul>
        <template v-for="index in totalDays" :key="index">
          <li
            :class="{ active: currentDay >= index }"
            @mouseover="onMouseOver(index)"
          ></li>
        </template>
      </ul>
    </div>
  </Transition>
</template>

<script>
import { markersArray } from "../Experience/Data/markers.js";
import { getMarkerByDay } from "../Experience/Utils/Utils.js";

export default {
  name: "timeline",
  props: {
    manager: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      show: false,
      currentDay: 1,
      totalDays: 12,
    };
  },
  methods: {
    onTimelineUpdate(marker) {
      if (marker.type === "main") {
        const chapterIndex = this.manager.getCurrentChapterIndex();
        this.currentDay =
          marker.day.length === 1 ? marker.day[0] : marker.day[chapterIndex];
      }
    },
    onMouseOver(index) {
      const marker = getMarkerByDay(markersArray, index);
      console.log(marker.name);
    },
  },
  mounted() {
    this.manager.on("loader-hidden", () => {
      this.show = true;
    });

    this.manager.on("timeline-show", () => {
      this.show = true;
    });

    this.manager.on("timeline-hide", () => {
      this.show = false;
    });

    this.manager.on("timeline-update", this.onTimelineUpdate.bind(this));
  },
};
</script>

<style scoped lang="scss">
.timeline {
  position: absolute;
  top: 50%;
  left: 35px;
  transform: translateY(-50%);
  z-index: $z-ui;

  ul {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: column;
    height: 50vh;

    &:before,
    &:after {
      display: block;
      content: "";
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 100%;
      background: var(--secondary-bg-color);
      z-index: -1;
    }

    li {
      display: block;
      position: relative;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--secondary-bg-color);
      z-index: 1;

      &:after {
        display: block;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        content: "";
        opacity: 1;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--secondary-text-color);
        opacity: 0;
      }

      &.active {
        cursor: pointer;
        opacity: 1;

        &:after {
          opacity: 1;
        }
        // background: var(--secondary-text-color);
      }
    }
  }
}
</style>
