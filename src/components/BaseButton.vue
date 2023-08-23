<script setup>
defineProps({
  primary: Boolean,
  secondary: Boolean,
  small: Boolean,
  control: Boolean,
  tiny: Boolean
})
</script>

<template>
  <button class="base-button" :class="{ primary, secondary, small, control, tiny }">
    <slot>Button</slot>
  </button>
</template>

<style lang="scss" scoped>
button {
  cursor: pointer;
  padding: calc(var(--spacing-s) + var(--spacing-xs));
  border-radius: var(--ui-border-radius);
  color: inherit;
  background: none;
  border: none;
  font-size: inherit;

  transition: all var(--transition);

  &:hover {
    // background: var(--ui-backdrop);
    color: var(--ui-accent-dark);
  }

  &:disabled {
    color: var(--ui-text-disabled);
    cursor: default;
  }

  &.primary {
    &:disabled {
      outline: 1px solid var(--ui-backdrop);
    }
    &:not(:disabled) {
      background: var(--ui-accent-dark);
      color: var(--ui-text-inverted);

      &:hover {
        background: var(--ui-accent-deep);
      }
    }
  }
  &.secondary {
    outline: 1px solid transparent;
    &:disabled {
      outline: 1px solid var(--ui-backdrop);
    }
    &:not(:disabled) {
      background: var(--ui-backdrop);
      // color: var(--ui-text-inverted);

      &:hover {
        outline: 1px solid var(--ui-accent-dark);
      }
    }
  }

  &.small {
    padding: var(--spacing-s);
    border-radius: var(--ui-border-radius-s);
    outline-offset: -1px;
  }

  &.tiny {
    padding: 0;
  }

  &.control {
    &:hover {
      background: var(--ui-accent-light);
      color: var(--ui-accent-deep);
    }
  }
}
</style>
