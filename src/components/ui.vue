<template>
  <div class="ui">
    <Transition name="fade">
      <div class="ui--title" v-if="showTitle">
        <h1>Valley</h1>
        <h3>an Explorative Experiment</h3>
        <Transition name="fade"> </Transition>
      </div>
    </Transition>

    <Transition name="fade-menu">
      <div class="ui--menu" v-if="showMenu">
        <p v-html="$t('tooltip.tutorial.one')"></p>
        <div class="ui--menu-buttons">
          <button @click="start('game')">{{ $t("menu.start") }}</button>
          <button @click="start('tutorial')">{{ $t("menu.tuto") }}</button>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div class="ui--chapter" v-if="showChapter">
        <h2>{{ title }}</h2>
        <h3>{{ subtitle }}</h3>
      </div>
    </Transition>

    <Transition name="fade">
      <div class="ui--step" v-if="showStep">
        <h2>{{ activeMarker.displayName }}</h2>
        <h3>
          Altitude {{ activeMarker.altitude }} // Day
          {{ activeMarker.day[0] }}
        </h3>
      </div>
    </Transition>

    <Transition name="slide-fade">
      <div
        class="ui--speech-bubble"
        v-if="showTooltip"
        v-html="tooltipText"
      ></div>
    </Transition>
  </div>
</template>

<script>
export default {
  name: "ui",
  props: {
    manager: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      showMenu: false,
      showChapter: false,
      showTitle: false,
      title: "",
      subtitle: "",
      showStep: false,
      activeMarker: null,
      showTooltip: false,
      tooltipText: "",
      autoHideDuration: 6000,
    };
  },
  methods: {
    start(mode) {
      this.showMenu = false;
      if (mode === "game") {
        this.manager.startGame();
      } else if (mode === "tutorial") {
        this.manager.goToTutorialStep(1);
      }
    },
    uiShowTooltip(key, callback) {
      this.tooltipText = this.$t(key);
      this.showTooltip = true;

      if (callback && typeof callback === "function") {
        setTimeout(callback, 1000);
      }
    },
    uiHideTooltip(callback) {
      this.showTooltip = false;

      if (callback && typeof callback === "function") {
        setTimeout(callback, 1000);
      }
    },
    uiShowAndHideTooltip(key, arrayParam) {
      this.tooltipText = this.$t(key, arrayParam);
      this.showTooltip = true;

      setTimeout(() => {
        this.showTooltip = false;
      }, this.autoHideDuration);
    },
    uiHideTitle(callback) {
      this.showTitle = false;
      if (callback && typeof callback === "function") {
        setTimeout(callback, 1000);
      }
    },
  },
  mounted() {
    this.showTitle = true;
    this.manager.on("loaded", () => {
      this.manager.trigger("loader-hide", () => {
        this.showMenu = true;
      });
    });

    this.manager.on("ui-title-show", () => {
      this.showTitle = true;
    });

    this.manager.on("ui-title-hide", this.uiHideTitle.bind(this));

    this.manager.on("ui-chapter-show", (chapterNumber) => {
      this.title = this.$t(`chapter.title${chapterNumber}`);
      this.subtitle = this.$t(`chapter.subtitle${chapterNumber}`);
      this.showChapter = true;

      setTimeout(() => {
        this.showChapter = false;
      }, this.autoHideDuration);
    });

    this.manager.on("ui-chapter-hide", () => {
      this.showChapter = false;
    });

    this.manager.on("ui-tooltip-show", this.uiShowTooltip.bind(this));

    this.manager.on("ui-tooltip-hide", this.uiHideTooltip.bind(this));

    this.manager.on(
      "ui-tooltip-auto-hide",
      this.uiShowAndHideTooltip.bind(this)
    );

    this.manager.on("ui-step-show", (activeMarker) => {
      this.activeMarker = activeMarker;
      this.showChapter = false;
      this.showStep = true;
    });

    this.manager.on("ui-step-hide", () => {
      this.activeMarker = null;
      this.showStep = false;
    });
  },
};
</script>

<style lang="scss" scoped>
.ui {
  position: relative;
  pointer-events: none;
  width: 100%;
  height: 100%;
  z-index: $z-ui;

  &--title {
    position: absolute;
    text-align: center;
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 10px;
    top: 0;
    padding-top: 45px;
    left: 50%;
    transform: translateX(-50%);
    color: var(--main-text-color);
    white-space: nowrap;

    h1 {
      font-size: 150px;
    }

    h3 {
      margin-top: -15px;
    }
  }

  &--menu {
    pointer-events: all;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 510px;
    padding: 35px;
    background: var(--secondary-bg-color);
    border-radius: 20px;
    box-shadow: 4px 4px 0px 1px var(--secondary-text-color);

    p {
      letter-spacing: 1px;
      color: var(--secondary-text-color);
      font-size: 18px;
      text-align: justify;
    }

    button {
      cursor: pointer;
      background: none;
      border: 2px solid var(--secondary-text-color);
      padding: 15px;
      text-transform: uppercase;
      min-width: 165px;
      color: var(--secondary-text-color);
      font-weight: 500;
      letter-spacing: 2px;
      font-weight: 700;
      margin: 0 15px;
    }
  }

  &--menu-buttons {
    display: flex;
    padding-top: 55px;
    justify-content: space-around;
  }

  &--chapter {
    position: absolute;
    text-align: center;
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 10px;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    color: var(--main-text-color);
    white-space: nowrap;

    h2 {
      font-size: 130px;
    }

    h3 {
      font-size: 35px;
    }
  }

  &--step {
    position: absolute;
    text-align: left;
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 10px;
    top: 60px;
    left: 60px;
    color: var(--main-text-color);
    white-space: nowrap;

    h2 {
      font-size: 76px;
    }
  }

  &--speech-bubble {
    position: absolute;
    max-width: 510px;
    padding: 25px 25px 25px 45px;
    right: 50px;
    bottom: 50px;
    letter-spacing: 1px;
    font-size: 18px;
    background: var(--secondary-bg-color);
    color: var(--secondary-text-color);
    border-radius: 0px 20px 0px 20px;
    box-shadow: 4px 4px 0px 1px var(--secondary-text-color);

    &:after {
      font-size: 120px;
      display: block;
      position: absolute;
      top: -40px;
      left: 5px;
      content: "“";
      color: var(--secondary-text-color);
    }
  }
}
</style>
