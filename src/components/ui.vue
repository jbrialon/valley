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
      showTitle: "",
      title: "",
      subtitle: "",
      showTooltip: false,
      tooltipText: "",
    };
  },
  mounted() {
    this.manager.on("ui-title-show", (title, subtitle) => {
      this.showTitle = true;
    });

    this.manager.on("ui-title-hide", (title, subtitle) => {
      this.showTitle = false;
    });

    this.manager.on("ui-tooltip", (tooltipText) => {
      this.tooltipText = tooltipText;
      this.showTooltip = true;

      setTimeout(() => {
        this.showTooltip = false;
      }, 3000);
    });
  },
};
</script>

<template>
  <div class="ui">
    <Transition name="slide-fade-title">
      <div class="ui--chapter" v-if="showTitle">
        <h2>Chapter 1</h2>
        <h3>Langtang Valley</h3>
      </div>
    </Transition>
    <Transition name="slide-fade-tooltip">
      <div class="ui--speech-bubble" v-if="showTooltip">
        {{ tooltipText }}
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.ui {
  position: relative;
  pointer-events: none;
  width: 100vw;
  height: 100vh;
  z-index: $z-ui;

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

    h2 {
      font-size: 130px;
    }

    h3 {
      font-size: 35px;
    }
  }

  &--speech-bubble {
    position: absolute;
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
