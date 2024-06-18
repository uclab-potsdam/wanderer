<script setup>
defineProps({
  tag: {
    type: String,
    default: 'button'
  },
  active: {
    type: Boolean,
    default: false
  },
  primary: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>
<template>
  <component :is="tag" class="button" :class="{ active, primary }" :disabled="disabled">
    <slot />
  </component>
</template>
<style scoped>
.button {
  font: inherit;
  font-size: 0.8em;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2.5px 10px;
  border-radius: 5px;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;

  &.active {
    color: var(--ui-accent);
    background-color: color-mix(in lab, currentColor, transparent 90%);
  }

  &.primary {
    border: 1px solid currentColor;
  }

  &:not(:disabled):hover {
    color: var(--ui-accent);
    background-color: color-mix(in lab, currentColor, transparent 90%);
  }

  &:disabled {
    color: color-mix(in lab, currentColor, transparent 70%);
  }
}
</style>
