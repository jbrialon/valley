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
      currentDay: 0,
      totalDays: 12,
    };
  },
  methods: {
    onTimelineUpdate(marker) {
      if (marker.type === "main") {
        const chapterIndex = this.manager.getCurrentChapterIndex();
        this.currentDay =
          marker.day.length === 1 ? marker.day[0] : marker.day[chapterIndex];

        const progressPercentage =
          this.currentDay > 1
            ? ((this.currentDay - 1) / (this.totalDays - 1)) * 100
            : 0;

        document.documentElement.style.setProperty(
          "--timeline-bar-height",
          `${progressPercentage}%`
        );
      }
    },
    onMouseOver(index) {
      const marker = getMarkerByDay(markersArray, index);
    },
  },
  mounted() {
    this.manager.on("loader-hidden", () => {
      console.log("loaded");
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

    &:after {
      z-index: 0;
      height: var(--timeline-bar-height);
      transition: height 300ms ease-in-out;
      width: 1px;
      background: var(--secondary-text-color);
    }

    li {
      display: block;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background: var(--secondary-bg-color);
      transition: background 300ms ease-in-out 300ms;
      z-index: 1;

      &.active {
        cursor: pointer;
        opacity: 1;
        background: var(--secondary-text-color);
      }
    }
  }
}
</style>
