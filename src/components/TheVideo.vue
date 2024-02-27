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
  </main>
</template>

<style scoped>
.video {
  grid-column: video-start-x / video-end-x;
  grid-row: video-start-y / video-end-y;

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 80px;

  background: black;

  video {
    object-fit: cover;
    grid-column: 1 / -1;
    grid-row: 1 / -1;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>
