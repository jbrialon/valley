<template>
  <header class="top">
    <div class="brand">
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>
  </header>
</template>

<script>
export default {
  name: "top",
  props: {
    title: { required: true, type: String },
    subtitle: { type: String, default: "" },
  },
};
</script>

<style scoped>
.top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 38px 46px 0;
  pointer-events: none;
  z-index: var(--z-ui);
  font-family: var(--font-mono);
  color: var(--ui-text-color);
  text-transform: uppercase;
  text-shadow: var(--ui-text-halo);

  &::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 180px;
    background: linear-gradient(
      to bottom,
      var(--ui-scrim-color),
      rgb(from var(--ui-scrim-color) r g b / 0.16) 55%,
      rgb(from var(--ui-scrim-color) r g b / 0)
    );
    z-index: -1;
  }
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

h1 {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.16em;
}

.subtitle {
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0.2em;
}

@media (max-width: 720px) {
  .top {
    padding: 26px 26px 0;
  }
}
</style>
