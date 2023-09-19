<script setup>
import { useComposeStore } from '@/stores/compose'
const composeStore = useComposeStore()
</script>

<template>
  <path v-if="composeStore.drawingEdge" :d="composeStore.drawingEdge" />
</template>

<style lang="scss" scoped>
path {
  stroke-width: 2;
  stroke: var(--ui-accent-dark);
}
</style>
