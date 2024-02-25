<template>
  <div class="pointer-none">
    <Transition name="fade">
      <div class="loader" v-show="showLoader">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80px"
          height="60px"
          viewBox="5 0 80 60"
        >
          <path
            ref="path"
            id="wave"
            fill="none"
            stroke-width="3"
            stroke-linecap="round"
          ></path>
        </svg>
      </div>
    </Transition>
  </div>
</template>

<script>
// https://codepen.io/winkerVSbecks/pen/EVJGVj
const m = 0.512286623256592433;

export default {
  name: "loader",
  props: {
    manager: {
      required: false,
      type: Object,
    },
  },
  data() {
    return {
      showLoader: true,
    };
  },
  methods: {
    buildWave(w, h) {
      const a = h / 4;
      const y = h / 2;

      const pathData = [
        "M",
        w * 0,
        y + a / 2,
        "c",
        a * m,
        0,
        -(1 - a) * m,
        -a,
        a,
        -a,
        "s",
        -(1 - a) * m,
        a,
        a,
        a,
        "s",
        -(1 - a) * m,
        -a,
        a,
        -a,
        "s",
        -(1 - a) * m,
        a,
        a,
        a,
        "s",
        -(1 - a) * m,
        -a,
        a,
        -a,

        "s",
        -(1 - a) * m,
        a,
        a,
        a,
        "s",
        -(1 - a) * m,
        -a,
        a,
        -a,
        "s",
        -(1 - a) * m,
        a,
        a,
        a,
        "s",
        -(1 - a) * m,
        -a,
        a,
        -a,
        "s",
        -(1 - a) * m,
        a,
        a,
        a,
        "s",
        -(1 - a) * m,
        -a,
        a,
        -a,
        "s",
        -(1 - a) * m,
        a,
        a,
        a,
        "s",
        -(1 - a) * m,
        -a,
        a,
        -a,
        "s",
        -(1 - a) * m,
        a,
        a,
        a,
        "s",
        -(1 - a) * m,
        -a,
        a,
        -a,
      ].join(" ");

      this.$refs.path.setAttribute("d", pathData);
    },
  },
  mounted() {
    this.buildWave(90, 60);
    this.manager.on("loaded", () => {
      console.log("loaded");
      this.showLoader = false;
    });
  },
};
</script>

<style scoped lang="scss">
.loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  align-items: center;
  border: 3px solid var(--main-text-color);
  display: flex;
  height: 110px;
  margin: 0 auto;
  width: 110px;
  z-index: $z-ui;

  #wave {
    stroke: var(--main-text-color);
    stroke-dasharray: 0 16 101 16;
    animation: moveTheWave 2400ms linear infinite;
  }

  svg {
    margin: 0 auto;
    overflow: hidden;
  }

  @keyframes moveTheWave {
    0% {
      stroke-dashoffset: 0;
      transform: translate3d(0, 0, 0);
    }
    100% {
      stroke-dashoffset: -133;
      transform: translate3d(-90px, 0, 0);
    }
  }
}
</style>
