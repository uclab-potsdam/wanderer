<script setup>
import { computed } from 'vue'
import { useSyncStore } from '@/stores/sync'
const syncStore = useSyncStore()

const next = computed(() => {
  const remaining = syncStore.duration - syncStore.time
  return remaining < 10
})
</script>
<template>
  <div class="progress">
    <div :class="{ next }"></div>
  </div>
</template>
<style lang="scss" scoped>
.progress {
  pointer-events: none;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: var(--ui-border-radius);
  overflow: hidden;

  div {
    height: 100%;
    width: 0%;
    background: color-mix(in lab, var(--accent), transparent 80%);

    &.next {
      transition: width linear 10s;
      width: 100%;
    }
  }
}
</style>
