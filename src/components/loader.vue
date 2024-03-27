<template>
  <div class="pointer-none">
    <Transition name="fade">
      <div class="loader" v-if="showLoader">
        <p>{{ loadingText }}</p>
      </div>
    </Transition>
  </div>
</template>

<script>
let interval;
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
      index: 0,
    };
  },
  methods: {
    randomNumber(min, max) {
      return Math.random() * (max - min) + min;
    },
  },
  computed: {
    loadingText() {
      return this.$t(`loader.${this.index}`);
    },
  },
  mounted() {
    this.manager.on("loaded", () => {
      this.showLoader = false;
    });

    this.index = Math.round(this.randomNumber(0, 19));
    interval = setInterval(() => {
      this.index = Math.round(this.randomNumber(0, 19));
    }, 200);
  },
  unmounted() {
    console.log("unmount");
    clearInterval(interval);
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
  display: flex;
  height: 110px;
  margin: 0 auto;
  z-index: $z-ui;

  p {
    background: var(--secondary-bg-color);
    color: var(--secondary-text-color);
    border-radius: 20px;
    box-shadow: 4px 4px 0px 1px var(--secondary-text-color);
    border: 2px solid var(--secondary-text-color);
    padding: 20px;
  }
}
</style>
