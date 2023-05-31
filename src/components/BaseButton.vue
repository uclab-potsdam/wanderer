<script setup></script>

<template>
  <button @keydown.stop="() => ({})">
    <slot>Button</slot>
  </button>
</template>

<style lang="scss" scoped>
button {
  color: var(--primary);

  &:hover,
  &:focus-visible {
    color: var(--accent);
  }

  // &:focus {
  //   color: red;
  // }

  &:focus-visible {
    outline: 1px solid var(--accent);
    // outline-offset: -2px;
  }
}
</style>
