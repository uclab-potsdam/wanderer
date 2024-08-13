<script setup>
import { useVideoStore } from '@/stores/video'
import { useHelperStore } from '@/stores/helper'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

defineProps({
  letterbox: Boolean
})

const videoStore = useVideoStore()
const helperStore = useHelperStore()

const router = useRouter()

const video = ref(null)

const exhibitionMode = ref(import.meta.env.VITE_EXHIBITION_MODE === 'true')

const source = computed(() => helperStore.getMediaUrl(videoStore.video.file))

function onTimeUpdate() {
  if (video.value == null) return
  videoStore.time = video.value?.currentTime ?? 0
  // requestAnimationFrame(onTimeUpdate)
}

function onLoadStart(e) {
  e.target.currentTime = videoStore.playFrom ?? 0
  videoStore.playFrom = null
  // requestAnimationFrame(onTimeUpdate)
}

function requestNext() {
  if (videoStore.isExternalPlayer) {
    videoStore.requestNext()
  } else {
    router.push({ name: 'graph', params: { type: 'graph', id: videoStore.next } })
  }
}

function setDuration() {
  if (video.value == null) return
  videoStore.duration = video.value.duration
}

watch(
  () => videoStore.playFrom,
  (time) => {
    if (time == null) return
    video.value.currentTime = time
    videoStore.playFrom = null
  }
)

watch(
  () => videoStore.setPlaying,
  (playing) => {
    if (playing == null) return
    if (playing) {
      video.value.play()
    } else {
      video.value.pause()
    }
    videoStore.setPlaying = null
  }
)
</script>

<template>
  <main class="video">
    <video
      ref="video"
      crossorigin="anonymous"
      :autoplay="exhibitionMode"
      :controls="!exhibitionMode"
      :src="source"
      @loadstart="onLoadStart"
      @ended="requestNext"
      @timeupdate="onTimeUpdate"
      @pause="videoStore.playing = false"
      @play="videoStore.playing = true"
      @durationchange="setDuration"
    ></video>
    <div class="subtitle">
      {{ videoStore.subtitle }}
    </div>
  </main>
</template>

<style scoped>
.video {
  z-index: 1;
  grid-column: video-start / video-end;
  grid-row: video-start / video-end;

  display: grid;
  grid-template-columns:
    1fr
    [st-start] min(100% - 100px, 800px)
    [st-end] 1fr;
  grid-template-rows: 1fr 7.5%;

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
    pointer-events: none;
    position: relative;
    grid-column: st-start / st-end;
    grid-row: 1 / -2;
    display: flex;
    align-items: flex-end;
    justify-content: center;

    text-align: center;
    font-size: var(--font-size-subtitle);
    text-wrap: balance;
    color: white;
    text-shadow:
      -2px -2px 0 #000,
      0 -2px 0 #000,
      2px -2px 0 #000,
      2px 0 0 #000,
      2px 2px 0 #000,
      0 2px 0 #000,
      -2px 2px 0 #000,
      -2px 0 0 #000;
  }
}
</style>
