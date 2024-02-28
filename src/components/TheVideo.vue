<script setup>
import { useVideoStore } from '@/stores/video'
import { useHelperStore } from '@/stores/helper'
import { computed } from 'vue'

defineProps({
  letterbox: Boolean
})

const videoStore = useVideoStore()
const helperStore = useHelperStore()

const source = computed(() => helperStore.getMediaUrl(videoStore.video.file[0]))

function onTimeUpdate(e) {
  videoStore.time = e.target.currentTime
}
</script>

<template>
  <main class="video">
    <video
      crossorigin="anonymous"
      autoplay
      controls
      muted
      :src="source"
      @timeupdate="onTimeUpdate"
    ></video>
    <div class="subtitle">
      {{ videoStore.subtitle }}
    </div>
  </main>
</template>

<style scoped>
.video {
  grid-column: video-start-x / video-end-x;
  grid-row: video-start-y / video-end-y;

  display: grid;
  grid-template-columns:
    1fr
    [st-start] min(100% - 100px, 800px)
    [st-end] 1fr;
  grid-template-rows: 1fr 50px;

  background: black;

  video {
    object-fit: cover;
    grid-column: 1 / -1;
    grid-row: 1 / -1;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .subtitle {
    grid-column: st-start / st-end;
    grid-row: 1 / -2;
    display: flex;
    align-items: flex-end;
    justify-content: center;

    text-align: center;
    font-size: var(--font-size-subtitle);
    text-wrap: balance;
    color: white;
    text-shadow: -2px -2px 0 #000, 0 -2px 0 #000, 2px -2px 0 #000, 2px 0 0 #000, 2px 2px 0 #000,
      0 2px 0 #000, -2px 2px 0 #000, -2px 0 0 #000;
  }
}
</style>
