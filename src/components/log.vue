<template>
  <div class="pointer-none">
    <Transition name="slide-fade-log">
      <div class="log" v-show="show" ref="log">
        <h3>Travel Log</h3>
        <ul ref="list">
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
        <div class="log--content" ref="content">
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
          <div class="close">
            <button class="cross" @click="close()">Close</button>
          </div>
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
      this.wiggle();
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
    open(activeMarker) {
      this.activeMarker = activeMarker;
      const tl = gsap.timeline();
      tl.to(
        this.$refs.log,
        {
          width: "55vw",
          duration: 0.6,
          ease: "power2.inOut",
        },
        "open-1"
      );
      tl.to(
        this.$refs.list,
        {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => {
            this.$refs.list.style.display = "none";
          },
        },
        "open-1"
      );
      tl.to(
        this.$refs.log,
        {
          maxHeight: "90vh",
          duration: 0.6,
          ease: "power2.inOut",
          onStart: () => {
            this.$refs.content.style.display = "block";
          },
        },
        "open-2"
      );
      tl.to(
        this.$refs.content,
        {
          opacity: 1,
          duration: 0.6,
          ease: "power2.inOut",
        },
        "reveal"
      );
    },
    close() {
      const tl = gsap.timeline({
        onStart: () => {
          this.manager.zoomOutOfMarker();
        },
      });
      tl.to(
        this.$refs.content,
        {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut",
        },
        "hide"
      );
      tl.to(
        this.$refs.log,
        {
          maxHeight: "177px",
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => {
            this.$refs.content.style.display = "none";
          },
        },
        "close-1"
      );
      tl.to(
        this.$refs.log,
        {
          width: "250px",
          duration: 0.6,
          ease: "power2.inOut",
        },
        "close-2"
      );
      tl.to(
        this.$refs.list,
        {
          opacity: 1,
          delay: 0.1,
          duration: 0.6,
          ease: "power2.inOut",
          onStart: () => {
            this.$refs.list.style.display = "block";
          },
        },
        "close-2"
      );
    },
  },
  mounted() {
    this.updateLogTotal();
    this.manager.on("log-show", () => {
      this.show = true;
    });
    this.manager.on("log-update-count", this.updateLogCount.bind(this));
    this.manager.on("log-update-total", this.updateLogTotal.bind(this));

    this.manager.on("log-open", this.open.bind(this));
    this.manager.on("log-close", this.close.bind(this));
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
  border: 2px solid var(--secondary-text-color);

  @include ipad {
    right: 25px;
    top: 25px;
  }

  .close {
    position: absolute;
    top: 3px;
    right: 20px;
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
    padding: 25px 0px 15px 0;

    img {
      display: block;
      max-width: 100%;
      margin: 0 auto 25px auto;
      max-height: 70vh;
      border: 10px solid var(--bg-button);

      @include ipad {
        max-height: 55vh;
      }
    }

    p {
      font-family: "Libre Baskerville";
      text-transform: none;
      font-size: 14px;
      line-height: 1.55;
      padding-bottom: 15px;
    }

    button {
      margin-top: 15px;
    }
  }

  h3 {
    font-size: 29px;
    letter-spacing: 2px;
  }

  ul {
    padding-top: 10px;
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
