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
  },
  disablePadding: {
    type: Boolean,
    default: false
  }
})
</script>
<template>
  <component
    :is="tag"
    class="button"
    :class="{ active, primary, 'disable-padding': disablePadding }"
    :disabled="disabled"
  >
    <slot />
  </component>
</template>
<style scoped>
.button {
  display: flex;
  justify-content: center;
  align-items: center;
  font: inherit;
  font-size: 0.8em;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  text-decoration: none;

  &:not(.disable-padding) {
    padding: var(--spacing-quart) var(--spacing-half);
  }

  &.primary {
    border: 1px solid currentColor;
  }

  &:not(:disabled):hover,
  &.active,
  &.router-link-exact-active {
    background: color-mix(in lab, var(--ui-accent), transparent 70%);
    color: var(--ui-accent-deep);
  }

  &:disabled {
    color: color-mix(in lab, currentColor, transparent 70%);
  }
}
</style>
