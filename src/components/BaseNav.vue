<template>
  <nav>
    <slot>Navigation</slot>
  </nav>
</template>

<style lang="scss" scoped>
nav {
  display: flex;
  gap: var(--spacing-l);

  :deep(a) {
    &.router-link-active {
      border-bottom: 1px solid currentColor;
    }
  }
}
</style>
