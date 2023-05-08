<script setup>
defineProps({
  primary: Boolean,
  secondary: Boolean,
  icon: Boolean,
});
</script>

<template>
  <button :class="{ primary, secondary, basic: !primary && !secondary }">
    <slot>Button</slot>
  </button>
</template>

<style lang="scss" scoped>
button {
  cursor: pointer;
  font-size: var(--font-size-s);
  text-transform: uppercase;
  padding: var(--spacing);

  // &:focus {
  //   outline: 1px solid var(--accent);
  //   outline-offset: -2px;
  // }

  &.primary {
    background-color: var(--primary);
    color: var(--secondary);

    &:hover,
    &:focus-visible {
      background-color: var(--accent);
    }
  }

  &.basic {
    &:focus-visible {
      outline: 1px solid var(--accent);
      outline-offset: -2px;
    }
  }

  // cursor: pointer;
  // // transition: color var(--transition);

  // &.primary {

  //   &:hover,
  //   &:focus {
  //     background-color: var(--accent);
  //   }

  //   &:focus {
  //     outline: 1px solid var(--accent);
  //     outline-offset: 2px;
  //   }
  // }

  // &.secondary {
  //   background-color: var(--secondary);
  //   border: 1px solid currentColor;
  //   // color: var(--secondary);
  //   // color: var(--accent);
  // }

  // &.icon {
  //   padding: 0 var(--spacing);
  // }

  // &.large {
  //   font-size: var(--font-size);
  //   text-transform: capitalize;
  // }

  // &.outline {
  //   border: 1px solid currentColor;
  // }

  // &.round {
  //   border-radius: 50%;
  // }

  // &.small {
  //   padding: var(--spacing-s);
  // }
}
</style>
