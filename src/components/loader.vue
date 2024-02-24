<template>
  <div class="loader">
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
        stroke="#c5c5c5"
        stroke-width="3"
        stroke-linecap="round"
      ></path>
    </svg>
  </div>
</template>

<script>
// https://codepen.io/winkerVSbecks/pen/EVJGVj
const m = 0.512286623256592433;

export default {
  name: "loader",
  props: {
    manager: {
      required: true,
      type: Object,
    },
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
  },
};
</script>

<style scoped lang="scss">
.loader {
  position: absolute;
  align-items: center;
  border: 3px solid #c5c5c5;
  display: flex;
  height: 110px;
  margin: 0 auto;
  width: 110px;

  #wave {
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
