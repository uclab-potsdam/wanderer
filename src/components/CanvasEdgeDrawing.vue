<script setup>
import { useComposeStore } from '@/stores/compose'
const composeStore = useComposeStore()
</script>

<template>
  <path v-if="composeStore.drawingEdge" :d="composeStore.drawingEdge" />
</template>

<style lang="scss" scoped>
path {
  stroke-width: 1;
  stroke: var(--edge-stroke-accent);
}
</style>
