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

  position: relative;
  display: flex;
  flex-direction: column;
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
  /* backdrop-filter: var(--blur); */
  border-radius: var(--border-radius);
  padding: var(--border-radius-small);
  gap: var(--border-radius-small);
  color: color-mix(in lab, var(--tint), var(--color-text) 60%);

  &:deep(> *) {
    border-radius: var(--border-radius-small);
  }

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    backdrop-filter: var(--blur);
    z-index: -1;
    border-radius: var(--border-radius);
    top: 0;
    left: 0;
  }
}
</style>
