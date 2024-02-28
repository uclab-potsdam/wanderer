<script setup>
import { useVideoStore } from '@/stores/video'

import TheGraph from '@/components/TheGraph.vue'
import TheVideo from '@/components/TheVideo.vue'

const videoStore = useVideoStore()
</script>

<template>
  <div class="graph-view" :class="{ 'split-screen': videoStore.playSplitScreen }">
    <TheGraph />
    <TheVideo v-if="videoStore.playSplitScreen" />
  </div>
  <!-- <ThePlayer width="450" v-if="!syncStore.hasPlayer" /> -->
  <!-- <TheRelatedGraphs /> -->
</template>

<style scoped>
.graph-view {
  --font-size-subtitle: max(2vw, 40px);

  grid-column: 1 / -1;
  grid-row: 1 / -1;

  max-height: 100vh;
  display: grid;

  grid-template-columns:
    [graph-start-x video-start-x] 1fr
    [graph-end-x video-end-x];

  grid-template-rows:
    [graph-start-y video-start-y] 1fr
    calc(var(--spacing) * 2)
    [graph-end-y video-end-y];

  &.split-screen {
    grid-template-columns:
      [graph-start-x] 1fr
      [graph-end-x video-start-x] 1fr
      [video-end-x];

    grid-template-rows:
      [graph-start-y video-start-y] 1fr
      calc(var(--spacing) * 2)
      [graph-end-y video-end-y];
  }
}
</style>
