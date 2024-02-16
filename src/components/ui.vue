<template>
  <div class="ui">
    <Transition name="fade">
      <div class="ui--title" v-if="showTitle">
        <h1>Valley</h1>
        <h3>an Explorative Experiment</h3>
        <Transition name="fade">
          <p v-if="showParagraph">
            {{ $t("title.paragraph") }}
          </p>
        </Transition>
      </div>
    </Transition>

    <Transition name="fade">
      <div class="ui--title-menu" v-if="showMenu">
        <div class="ui--title-menu-container">
          <button @click="start('game')">{{ $t("menu.start") }}</button>
          <button @click="start('tutorial')">{{ $t("menu.tuto") }}</button>
        </div>
      </div>
    </Transition>

    <Transition name="slide-fade">
      <div class="ui--chapter" v-if="showChapter">
        <h2>{{ title }}</h2>
        <h3>{{ subtitle }}</h3>
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
      showParagraph: true,
      showChapter: false,
      showTitle: true,
      title: "",
      subtitle: "",
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
        this.showParagraph = false;
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
  },
  mounted() {
    this.manager.on("loaded", () => {
      this.showMenu = true;
    });

    this.manager.on("ui-title-show", () => {
      this.showTitle = true;
    });

    this.manager.on("ui-title-hide", () => {
      this.showTitle = false;
    });

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
    padding-top: 65px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    white-space: nowrap;

    h1 {
      font-size: 150px;
    }

    h3 {
      margin-top: -15px;
    }

    p {
      white-space: break-spaces;
      font-family: Libre Baskerville;
      max-width: 55vh;
      text-transform: none;
      letter-spacing: 2px;
      font-size: 19;
      margin: auto;
      margin-top: 25vh;
      line-height: 2;
    }
  }

  &--title-menu {
    display: flex;
    pointer-events: all;
    justify-content: center;
    align-items: flex-end;
    height: 100%;
    width: 100%;

    button {
      cursor: pointer;
      background: none;
      border: 2px solid white;
      padding: 15px;
      text-transform: uppercase;
      min-width: 165px;
      color: white;
      font-weight: 500;
      letter-spacing: 1px;
      margin: 0 15px;
    }
  }

  &--title-menu-container {
    padding-bottom: 75px;
    flex-grow: 0;
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
    color: white;
    white-space: nowrap;

    h2 {
      font-size: 130px;
    }

    h3 {
      font-size: 35px;
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
    background: #f4e2d6;
    color: #5a5444;
    border-radius: 0px 20px 0px 20px;
    box-shadow: 4px 4px 0px 1px #5a5444;

    &:after {
      font-size: 120px;
      display: block;
      position: absolute;
      top: -40px;
      left: 5px;
      content: "“";
      color: #5a5444;
    }
  }
}
</style>

<!-- .infowindow {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 30;
    display: none;
  
    .inner {
      position: relative;
      left: -50%;
      bottom: 100px;
      padding-bottom: 100px;
    }
  }
  
  .content {
    position: relative;
    opacity: 0;
    cursor: pointer;
    font-weight: 500;
    letter-spacing: 1px;
    color: #5a5444;
    padding: 6px 12px;
    background: #f4e2d6;
    box-shadow: 4px 4px 0px 1px #5a5444;
  } -->
