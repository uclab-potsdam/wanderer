<script setup></script>

<template>
  <div class="base-button-group">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.base-button-group {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  text-align: center;
  align-self: center;

  background: var(--ui-backdrop-translucent);
  backdrop-filter: blur(7px);
  border-radius: var(--ui-border-radius);
  padding: var(--spacing-xs);
  gap: var(--spacing-xs);
}
</style>
