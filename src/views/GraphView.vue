<script setup>
import { useRoute } from 'vue-router'
import { useVideoStore } from '@/stores/video'
import { useSettingsStore } from '@/stores/settings'

import TheGraph from '@/components/TheGraph.vue'
import TheVideo from '@/components/TheVideo.vue'
import TheControls from '@/components/TheControls.vue'
import TheHeader from '@/components/TheHeader.vue'
import TheToolbar from '@/components/TheToolbar.vue'
import { computed } from 'vue'
import TheFooter from '@/components/TheFooter.vue'

const videoStore = useVideoStore()
const settingsStore = useSettingsStore()
const route = useRoute()

const fullscreenGraph = computed(() => {
  return (
    !videoStore.showVideo || !settingsStore.pictureInPicture || settingsStore.pictureInPictureVideo
  )
})
</script>

<template>
  <div
    class="graph-view"
    :class="{
      'split-screen': videoStore.showVideo && !settingsStore.pictureInPicture,
      'pip-graph':
        videoStore.showVideo &&
        settingsStore.pictureInPicture &&
        !settingsStore.pictureInPictureVideo
    }"
    @wheel.prevent
  >
    <TheVideo class="video" v-if="videoStore.showVideo" :class="{ fullscreen: !fullscreenGraph }" />
    <TheGraph class="graph" :class="{ fullscreen: fullscreenGraph }" />
    <div
      class="toggle-pip"
      @click="settingsStore.pictureInPictureVideo = !settingsStore.pictureInPictureVideo"
    ></div>
    <div class="interface-layer fullscreen">
      <TheHeader />
      <TheControls />
      <TheToolbar v-if="settingsStore.edit" />
      <TheFooter v-if="!settingsStore.edit" />
      <TheFooter style="bottom: 70px" v-else />
    </div>
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
  position: relative;
  display: grid;

  grid-template-columns:
    [main-start] 1fr
    [header-end];

  grid-template-rows:
    [main-start]
    1fr
    [controls-end];

  .fullscreen {
    grid-column: main-start / main-end;
    grid-row: main-start / main-end;
    position: relative;
  }

  .video:not(.fullscreen),
  .graph:not(.fullscreen),
  .toggle-pip {
    position: absolute;
    top: var(--spacing-half);
    right: var(--spacing-half);
    width: min(calc(50vw - var(--spacing) * 2), 360px);
    height: calc(min(calc(50vw - var(--spacing) * 2), 360px) / (16 / 9));
    border-radius: var(--border-radius);
    z-index: 1;
  }

  .graph {
    &:not(.fullscreen) {
      background: var(--color-background);
    }
  }

  .toggle-pip {
    /* transition: backdrop-filter var(--ui-transition);
    &:hover {
      backdrop-filter: var(--blur);
    } */
  }

  .interface-layer {
    pointer-events: none;
    > * {
      pointer-events: initial;
    }
  }

  .video {
  }

  &.split-screen {
    --font-size-subtitle: max(2vw, 40px);
    grid-template-columns:
      [main-start video-start]
      1fr
      [main-end video-end];

    grid-template-rows:
      [video-start] min(calc(100vw / (16 / 9)), 50vh)
      [video-end main-start] 1fr
      [main-end];

    @media (min-aspect-ratio: 3/2) {
      grid-template-columns:
        [main-start] 1fr
        [main-end video-start] 1fr
        [video-end];

      grid-template-rows:
        [main-start video-start]
        1fr
        [main-end video-end];
    }

    .video {
      z-index: 1;
      grid-column: video-start / video-end;
      grid-row: video-start / video-end;
      position: unset;
      top: unset;
      right: unset;
      width: unset;
      height: unset;
      border-radius: unset;
    }

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
