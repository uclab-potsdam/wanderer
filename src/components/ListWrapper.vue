<script setup>
defineProps({
  horizontal: Boolean,
  equalSize: Boolean
})
</script>
<template>
  <div class="list-wrapper" :class="{ horizontal, 'equal-size': equalSize }"><slot /></div>
</template>

<style scoped>
.list-wrapper {
  --tint: var(--accent, var(--ui-accent));

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &.horizontal {
    flex-direction: row;
  }

  &.equal-size {
    display: grid;
    grid-auto-rows: 1fr;
    grid-auto-flow: rows;

    &.horizontal {
      grid-auto-columns: 1fr;
      grid-auto-flow: column;
    }
  }

  text-align: center;

  background: color-mix(in lab, var(--tint), rgba(255, 255, 255, 0.5) 90%);
  backdrop-filter: var(--blur);
  border-radius: var(--border-radius);
  padding: var(--border-radius-half);
  gap: var(--border-radius-half);
  color: color-mix(in lab, var(--tint), var(--color-text) 60%);

  &:deep(> *) {
    border-radius: var(--border-radius-half);
  }
}
</style>
