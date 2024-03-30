<template>
  <Transition name="fade">
    <header class="top" v-if="show">
      <h1>Chapter 1</h1>
      <nav>
        <ul>
          <li>
            <button class="btn">
              <span class="icon-sound-on"></span>
            </button>
          </li>
          <li>
            <button class="btn">
              <span class="icon-settings"></span>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  </Transition>
</template>

<script>
export default {
  name: "top",
  props: {
    manager: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      show: false,
    };
  },
  methods: {},
  mounted() {
    this.manager.on("header-show", () => {
      this.show = true;
    });

    this.manager.on("header-hide", () => {
      this.show = false;
    });
  },
};
</script>

<style scoped lang="scss">
header.top {
  position: absolute;
  display: flex;
  padding: 0 25px;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  width: 100%;
  z-index: $z-ui;

  h1 {
    margin-top: 15px;
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 1px;
    left: 50%;
    color: var(--main-text-color);
    letter-spacing: 2px;
    text-shadow: 3px 3px 0px var(--secondary-text-color);
  }

  nav {
    display: none;
    margin-left: auto;

    ul {
      list-style: none;
      display: flex;
    }

    button {
      pointer-events: all;
      position: relative;
      width: 60px;
      height: 60px;
      min-width: 0;
      margin: 15px 25px;
      cursor: pointer;
      border: 2px solid var(--secondary-text-color);
      background: var(--secondary-bg-color);
      color: var(--secondary-text-color);
      border-radius: 12px;
      font-size: 26px;
    }
  }
}
</style>
