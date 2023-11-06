<script setup>
import { computed } from 'vue'
import { useSyncStore } from '@/stores/sync'
const syncStore = useSyncStore()

const width = computed(() => {
  return `${syncStore.progress * 100}%`
})
</script>
<template>
  <div class="progress">
    <div :style="{ width }"></div>
  </div>
</template>
<style lang="scss" scoped>
.progress {
  width: 100%;
  height: var(--spacing-s);
  position: absolute;
  bottom: 0;
  left: 0;
  border-radius: 0 0 var(--ui-border-radius) var(--ui-border-radius);
  overflow: hidden;
  background: color-mix(in lab, var(--accent), transparent 80%);

  div {
    height: 100%;
    background: color-mix(in lab, var(--accent), black 50%);
  }
}
</style>
