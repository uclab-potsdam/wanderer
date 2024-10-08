<script setup>
import { useRoute } from 'vue-router'
import { useVideoStore } from '@/stores/video'
import { useSettingsStore } from '@/stores/settings'

import TheGraph from '@/components/TheGraph.vue'
import TheVideo from '@/components/TheVideo.vue'
import TheControls from '@/components/TheControls.vue'
import TheHeader from '@/components/TheHeader.vue'
import TheToolbar from '@/components/TheToolbar.vue'

const videoStore = useVideoStore()
const settingsStore = useSettingsStore()
const route = useRoute()
</script>

<template>
  <div
    class="graph-view"
    :class="{ 'split-screen': videoStore.showVideo && !settingsStore.pictureInPicture }"
    @wheel.prevent
  >
    <TheHeader v-if="!route.meta.hideMenuBar" />
    <TheGraph />
    <TheVideo v-if="videoStore.showVideo" />
    <TheControls />
    <TheToolbar v-if="settingsStore.edit" />
  </div>
  <!-- <ThePlayer width="450" v-if="!syncStore.hasPlayer" /> -->
  <!-- <TheRelatedGraphs /> -->
</template>

<style scoped>
.graph-view {
  --font-size-subtitle: 16px;

  grid-column: 1 / -1;
  grid-row: 1 / -1;

  max-height: 100vh;
  display: grid;

  grid-template-columns:
    [graph-start controls-start header-start] 1fr
    [video-start] 320px
    [video-end] var(--spacing-half)
    [graph-end controls-end header-end];

  grid-template-rows:
    [graph-start header-start] var(--spacing-double)
    [header-end]
    1fr
    [video-start]
    180px
    [video-end] var(--spacing-half)
    [controls-start] var(--spacing-quad)
    [graph-end controls-end];

  &.split-screen {
    --font-size-subtitle: max(2vw, 40px);
    grid-template-columns:
      [graph-start controls-start header-start] 1fr
      [graph-end controls-end video-start header-end] 1fr
      [video-end];

    grid-template-rows:
      [graph-start video-start header-start] var(--spacing-double)
      [header-end]
      1fr
      [controls-start] var(--spacing-double)
      [graph-end video-end controls-end];

    /* grid-template-rows:
      [graph-start header-start] var(--spacing-double)
      [header-end]
      1fr
      [controls-start] var(--spacing-double)
      [graph-end controls-end video-start]
      1fr
      [video-end]; */
  }
}
</style>
