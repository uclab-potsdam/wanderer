<script setup>
import { useVideoStore } from '@/stores/video'

import TheGraph from '@/components/TheGraph.vue'
import TheVideo from '@/components/TheVideo.vue'
import TheControls from '@/components/TheControls.vue'

const videoStore = useVideoStore()
</script>

<template>
  <div class="graph-view" :class="{ 'split-screen': videoStore.playSplitScreen }">
    <TheGraph />
    <TheVideo v-if="videoStore.playSplitScreen" />
    <TheControls />
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
    [graph-start-x video-start-x controls-start-x] 1fr
    [graph-end-x video-end-x controls-end-x];

  grid-template-rows:
    [graph-start-y video-start-y] 1fr
    [controls-start-y] calc(var(--spacing) * 2)
    [graph-end-y video-end-y controls-end-y];

  &.split-screen {
    grid-template-columns:
      [graph-start-x controls-start-x] 1fr
      [graph-end-x controls-end-x video-start-x] 1fr
      [video-end-x];
  }
}
</style>
