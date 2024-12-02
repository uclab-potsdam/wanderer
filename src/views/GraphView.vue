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
import TheAbout from '@/components/TheAbout.vue'

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
  >
    <TheVideo
      class="video"
      v-if="videoStore.showVideo"
      :class="{ fullscreen: !fullscreenGraph }"
      @wheel.prevent
    />
    <TheGraph class="graph" :class="{ fullscreen: fullscreenGraph }" @wheel.prevent />
    <div
      v-if="videoStore.showVideo"
      class="toggle-pip"
      @click="settingsStore.pictureInPictureVideo = !settingsStore.pictureInPictureVideo"
    ></div>
    <div class="interface-layer fullscreen">
      <TheHeader @wheel.prevent />
      <TheAbout />
      <TheControls @wheel.prevent />
      <TheToolbar v-if="settingsStore.edit" @wheel.prevent />
      <TheFooter class="no-events" @wheel.prevent />
    </div>
  </div>
  <!-- <ThePlayer width="450" v-if="!syncStore.hasPlayer" /> -->
  <!-- <TheRelatedGraphs /> -->
</template>

<style scoped>
.graph-view {
  --font-size-subtitle: 20px;

  grid-column: 1 / -1;
  grid-row: 1 / -1;

  max-height: var(--app-height);
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

  .video.fullscreen {
    --font-size-subtitle: min(5vw, 40px);
  }

  .video:not(.fullscreen),
  .graph:not(.fullscreen),
  .toggle-pip {
    position: absolute;
    top: var(--spacing-half);
    right: var(--spacing-half);
    width: min(calc(50vw - var(--spacing) * 2), 420px);
    height: calc(min(calc(50vw - var(--spacing) * 2), 420px) / (16 / 9));
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
    z-index: 1;
    container-type: size;
    position: relative;
    pointer-events: none;
    > *:not(.no-events) {
      pointer-events: initial;
    }
  }

  .video {
  }

  &.split-screen {
    --font-size-subtitle: min(5vw, 40px);
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
