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
        <p v-html="$t('title.paragraph')"></p>
        <div class="ui--menu-buttons">
          <button class="btn" @click="start('normal')" disabled>
            {{ $t("menu.start") }}
          </button>
          <button class="btn" @click="start('game')">
            {{ $t("menu.game") }}
          </button>
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

    <Transition name="slide-fade">
      <div class="ui--progress" v-if="showProgress">
        <ul>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
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
      showProgress: false,
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
      this.manager.trigger("markers-intro-animation");
      if (mode === "normal") {
        this.manager.startGame();
      } else if (mode === "game") {
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
      this.manager.trigger("camera-intro-animation");
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

    this.manager.on("ui-show-progress", () => {
      this.showProgress = true;
    });

    this.manager.on("ui-hide-progress", () => {
      this.showProgress = true;
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
    padding-top: 25px;
    left: 50%;
    transform: translateX(-50%);
    color: var(--main-text-color);
    white-space: nowrap;

    @include ipad {
      padding-top: 0;
    }

    h1 {
      font-size: 150px;
      text-shadow: 3px 3px 0px var(--secondary-text-color);
    }

    h3 {
      margin-top: -15px;
      text-shadow: 2px 2px 0px var(--secondary-text-color);
    }
  }

  &--menu {
    pointer-events: all;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 600px;
    padding: 35px;
    background: var(--secondary-bg-color);
    border-radius: 20px;
    box-shadow: 4px 4px 0px 1px var(--secondary-text-color);
    border: 2px solid var(--secondary-text-color);

    p {
      letter-spacing: 1px;
      color: var(--secondary-text-color);
      font-size: 18px;
      text-align: justify;
      line-height: 1.6;
    }
  }

  &--menu-buttons {
    display: flex;
    padding-top: 25px;
    justify-content: space-around;

    button {
      margin: 0 15px;
    }
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

    @include ipad {
      top: 0;
    }

    h2 {
      font-size: 130px;
      text-shadow: 3px 3px 0px var(--secondary-text-color);

      @include ipad {
        font-size: 65px;
      }
    }

    h3 {
      font-size: 35px;
      text-shadow: 2px 2px 0px var(--secondary-text-color);
      @include ipad {
        font-size: 25px;
      }
    }
  }

  &--step {
    position: absolute;
    text-align: left;
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 10px;
    top: 50px;
    left: 25px;
    color: var(--main-text-color);
    white-space: nowrap;

    @include ipad {
      left: 30px;
      top: 30px;
    }

    h2 {
      font-size: 76px;
      text-shadow: 3px 3px 0px var(--secondary-text-color);
      @include ipad {
        font-size: 36px;
      }
    }

    h3 {
      text-shadow: 2px 2px 0px var(--secondary-text-color);
      margin-top: 5px;

      @include ipad {
        font-size: 14px;
      }
    }
  }

  &--progress {
    position: absolute;
    top: 50%;
    left: 20px;
    transform: translateY(-50%);

    ul {
      position: relative;

      &:after {
        display: block;
        content: "";
        position: absolute;
        top: 0;
        left: calc(50% - 1px);
        bottom: 0;
        width: 3px;
        background: var(--secondary-text-color);
        z-index: -1;
      }

      li {
        display: block;
        width: 30px;
        height: 30px;
        margin: 25px;
        border-radius: 50%;
        background: var(--main-bg-color);
        border: 2px solid var(--secondary-text-color);
        //box-shadow: -0px 2px 0px 1px var(--secondary-text-color);

        &:first-child {
          background: var(--secondary-text-color);
        }
      }
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
    border: 2px solid var(--secondary-text-color);

    @include ipad {
      right: 25px;
      bottom: 25px;
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
  }
}
</style>
