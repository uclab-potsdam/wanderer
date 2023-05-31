<script setup>
import { useTerminusStore } from '@/stores/terminus'
import { useSyncStore } from '@/stores/sync'
import { useViewStore } from '@/stores/view'
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  letterbox: Boolean,
  width: { type: [Number, String] },
  height: { type: [Number, String] },
  position: { type: String, default: 'top-right' }
})

const route = useRoute()
const terminusStore = useTerminusStore()
const syncStore = useSyncStore()
const viewStore = useViewStore()

const document = ref({})
const sources = ref([])

const video = ref(null)
const pip = ref(false)

watch(
  () => route.params,
  async () => {
    document.value =
      route.params.type &&
      route.params.id &&
      (await terminusStore.getMedia(`${route.params.type}/${route.params.id}`))

    sources.value = document.value?.file?.map((d) => viewStore.getMediaUrl(d)) ?? []
  },
  { immediate: true }
)

onMounted(() => {
  requestAnimationFrame(update)
})

function update() {
  let currentTime = video.value?.currentTime
  // if (currentTime < range[0] || currentTime > range[1]) video.value.currentTime = currentTime = range[0];
  syncStore.updateTime(currentTime)
  requestAnimationFrame(update)
}
watch(
  () => syncStore.timeOverwrite,
  () => {
    video.value.currentTime = syncStore.timeOverwrite
  }
)

// might resolve https://github.com/uclab-potsdam/wanderer/issues/37
let playStateChange = false
watch(
  () => syncStore.playing,
  async () => {
    if (playStateChange) {
      console.log('cancelling')
      return
    }
    playStateChange = true
    await video.value[syncStore.playing ? 'play' : 'pause']()
    playStateChange = false
  }
)

watch(
  () => syncStore.mute,
  () => {
    video.value.muted = syncStore.mute
  }
)

function onVolumeChange() {
  syncStore.setMute(video.value.muted)
}

function setDuration() {
  syncStore.setDuration(video.value.duration)
}
</script>

<template>
  <div class="the-player" :class="[{ letterbox }, position]">
    <video
      v-if="sources.length > 0"
      loop
      autoplay
      muted
      ref="video"
      :style="{ width: isNaN(width) ? width : `${width}px` }"
      @durationchange="setDuration"
      @enterpictureinpicture="pip = true"
      @leavepictureinpicture="pip = false"
      @play="syncStore.setPlaying(true)"
      @pause="syncStore.setPlaying(false)"
      @volumechange="onVolumeChange"
    >
      <source v-for="(source, i) in sources" :key="i" :src="source" preload />
    </video>
  </div>
</template>

<style lang="scss" scoped>
.the-player {
  video {
    width: 100%;
    height: 100%;
    display: block;
  }
  &:not(.letterbox) {
    border-radius: var(--spacing-s);
    overflow: hidden;
    margin: var(--spacing);
    position: absolute;
    max-width: 90%;
    box-shadow: 2px 2px 5px var(--shadow);
    // max-height: 90%;

    &.top-left {
      left: 0;
    }
    &.top-right {
      right: 0;
    }

    &.bottom-left {
      left: 0;
      bottom: 0;
    }

    &.bottom-right {
      right: 0;
      bottom: 0;
    }
  }

  &.letterbox {
    video {
      position: absolute;
      object-fit: contain;
      background: black;
      top: 0;
    }
  }
}
</style>
