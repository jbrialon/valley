<template>
  <div class="pointer-none">
    <Transition name="slide-fade-log">
      <div class="log" v-show="show" ref="log" :class="{ open: open }">
        <h3>Travel Log</h3>
        <ul>
          <li>
            <span>Chapter</span>
            <span>{{ currentChapterIndex + 1 }}</span>
          </li>

          <li>
            <span>Milestones</span>
            <span>{{ step.count }}/{{ step.total }}</span>
          </li>
          <li v-if="bonus.total > 0">
            <span>Highlight</span>
            <span>{{ bonus.count }}/{{ bonus.total }}</span>
          </li>
        </ul>
        <div class="log--content">
          <img
            v-if="activeMarker?.photo"
            :src="activeMarker.photo"
            :alt="`photo taken of ${activeMarker.displayName}`"
          />
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
            interdum velit et lectus consectetur, eget viverra lacus accumsan.
            Praesent vel mi vel libero facilisis porttitor. Nam rutrum interdum
            semper.
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { gsap } from "gsap";
import { markers } from "../Experience/Data/markers.js";

export default {
  name: "log",
  props: {
    manager: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      show: false,
      open: false,
      currentChapterIndex: 0,
      currentChapter: "",
      revealedSteps: {},
      step: {
        count: 0,
        total: 0,
      },
      bonus: {
        count: 0,
        total: 0,
      },
      activeMarker: null,
    };
  },
  methods: {
    wiggle() {
      if (this.show) {
        gsap.to(this.$refs.log, {
          keyframes: [
            { rotation: -1, duration: 0.05 },
            { rotation: 1, duration: 0.05 },
          ],
          repeat: 3,
          yoyo: true, // Go back and forth
          ease: "power4.inOut",
        });
      }
    },
    updateLogCount() {
      this.revealedSteps = this.manager.getRevealedStepsPerChapter();
      this.step.count = this.revealedSteps.length;
      // this.wiggle();
    },
    updateLogTotal() {
      this.updateLogCount();

      this.currentChapterIndex = this.manager.getCurrentChapterIndex();
      this.currentChapter = this.manager.getCurrentChapter();
      this.step.total = markers[this.currentChapter].length;
      this.bonus.total = markers["bonus"].filter(
        (marker) => marker.chapter === this.currentChapter
      ).length;
    },
  },
  mounted() {
    this.updateLogTotal();
    this.manager.on("log-show", () => {
      this.show = true;
    });
    this.manager.on("log-update-count", this.updateLogCount.bind(this));
    this.manager.on("log-update-total", this.updateLogTotal.bind(this));
    this.manager.on("log-open", (activeMarker) => {
      this.activeMarker = activeMarker;
      this.open = true;
    });
    this.manager.on("log-close", () => {
      // this.activeMarker = null;
      this.open = false;
    });
  },
};
</script>

<style lang="scss" scoped>
.log {
  position: absolute;
  min-height: 177px;
  max-height: 177px;
  width: 250px;
  padding: 25px 25px 15px 35px;
  right: 50px;
  top: 50px;
  letter-spacing: 1px;
  font-size: 18px;
  background: var(--secondary-bg-color);
  color: var(--secondary-text-color);
  border-radius: 0px 20px 0px 20px;
  box-shadow: 4px 4px 0px 1px var(--secondary-text-color);
  z-index: $z-ui;
  transition-property: all;
  transition-duration: 600ms;
  transition-timing-function: ease-in-out;
  transition-delay: 600ms;

  &.open {
    width: 490px;
    min-height: auto;
    max-height: 900px;
    .log--content {
      opacity: 1;
      transition-delay: 1200ms;
    }

    ul {
      opacity: 0;
      transition-delay: 0s !important;
    }
  }

  &:after {
    font-size: 120px;
    display: block;
    position: absolute;
    top: -40px;
    left: 5px;
    content: "“";
    color: var(--secondary-text-color);
  }

  &--content {
    opacity: 0;
    transition-property: opacity;
    transition-duration: 300ms;
    padding: 25px 0px;

    img {
      display: block;
      max-width: 100%;
      margin-bottom: 25px;
    }

    p {
      font-family: Libre Baskerville;
      text-transform: none;
      letter-spacing: 1px;
      font-size: 14px;
      line-height: 1.4;
    }
  }
  h3 {
    font-size: 29px;
    letter-spacing: 2px;
  }

  ul {
    position: absolute;
    opacity: 1;
    transition-property: opacity;
    transition-duration: 300ms;
    transition-delay: 600ms;
    top: 60px;
    padding-top: 16px;
    list-style: none;

    li {
      padding-bottom: 6px;
      span:first-child {
        text-align: left;
        justify-content: start;
        min-width: 150px;
      }

      span {
        display: inline-flex;
        text-align: right;
        justify-content: center;
        min-width: 30px;
      }
    }
  }
}
</style>
