<template>
  <footer class="bottom">
    <div class="cue">Press <kbd>F</kbd> to explore</div>
  </footer>
</template>

<script>
export default {
  name: "bottom",
};
</script>

<style scoped>
.bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  padding: 0 46px 40px;
  pointer-events: none;
  z-index: var(--z-ui);
  font-family: var(--font-mono);
  color: var(--ui-text-color);
  text-transform: uppercase;
  text-shadow: var(--ui-text-halo);
}

.cue {
  font-size: 9px;
  line-height: 1;
  letter-spacing: 0.24em;
  white-space: nowrap;
}

kbd {
  display: inline-block;
  margin: 0 4px;
  padding: 3px 5px 2px;
  border: 1px solid var(--ui-text-color);
  border-radius: 3px;
  background: var(--ui-scrim-color);
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
  text-shadow: none;
  box-shadow: 0 1px 0 var(--ui-text-color);
}

@media (max-width: 720px) {
  .cue {
    display: none;
  }
}
</style>
