<template>
  <div class="pointer-none">
    <Transition name="slide-fade">
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
  computed: {},
  mounted() {
    this.updateLogTotal();
    this.manager.on("log-show", () => {
      this.show = true;
    });
    this.manager.on("log-update-count", this.updateLogCount.bind(this));
    this.manager.on("log-update-total", this.updateLogTotal.bind(this));
    this.manager.on("log-open", () => {
      this.open = true;
    });
    this.manager.on("log-close", () => {
      this.open = false;
    });
  },
};
</script>

<style lang="scss" scoped>
.log {
  position: absolute;
  max-width: 510px;
  padding: 25px 25px 25px 45px;
  right: 50px;
  top: 50px;
  letter-spacing: 1px;
  font-size: 18px;
  background: var(--secondary-bg-color);
  color: var(--secondary-text-color);
  border-radius: 0px 20px 0px 20px;
  box-shadow: 4px 4px 0px 1px var(--secondary-text-color);
  min-width: 250px;
  min-height: 150px;
  z-index: $z-ui;
  transition: all 600ms ease-in-out 150ms;

  &.open {
    min-width: 490px;
    min-height: 700px;
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

  h3 {
    font-size: 29px;
    letter-spacing: 2px;
  }

  ul {
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
