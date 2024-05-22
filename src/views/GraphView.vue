<script setup>
import { useVideoStore } from '@/stores/video'

import TheGraph from '@/components/TheGraph.vue'
import TheVideo from '@/components/TheVideo.vue'
import TheControls from '@/components/TheControls.vue'
import { ref } from 'vue';

const videoStore = useVideoStore()

const shift = ref(false)

window.addEventListener('keydown', ({key}) => {if(key === 'Shift') shift.value = true})
window.addEventListener('keyup', ({key}) => {if(key === 'Shift') shift.value = false})
</script>

<template>
  <div class="graph-view" :class="{ 'split-screen': videoStore.playSplitScreen, 'hide-cursor': !shift }">
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
    [controls-start-y] calc(var(--spacing) * 2.5)
    [graph-end-y video-end-y controls-end-y];

  &.split-screen {
    grid-template-columns:
      [graph-start-x controls-start-x] 1fr
      [graph-end-x controls-end-x video-start-x] 1fr
      [video-end-x];
  }

  &.hide-cursor {
    cursor: none !important;
    * {
      cursor: none !important;
    }
  }
}
</style>
