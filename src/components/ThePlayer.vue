<script setup>
// import { useTerminusStore } from '@/stores/terminus'
import { useSyncStore } from '@/stores/sync'
// import { useViewStore } from '@/stores/view'
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
// import { useRoute } from 'vue-router'

defineProps({
  letterbox: Boolean,
  width: { type: [Number, String] },
  height: { type: [Number, String] },
  position: { type: String, default: 'top-right' }
  // sources: { Array, default: () => [] }
})

const syncStore = useSyncStore()
// const sources = ref([])
const sources = computed(() => syncStore.sources)

const video = ref(null)
const pip = ref(false)

onMounted(() => {
  requestAnimationFrame(update)
})

onUnmounted(() => {
  cancelAnimationFrame(updateLoop)
})

let updateLoop = null

function update() {
  let currentTime = video.value?.currentTime
  // if (currentTime < range[0] || currentTime > range[1]) video.value.currentTime = currentTime = range[0];
  if (syncStore.playing || currentTime !== syncStore.time) syncStore.updateTime(currentTime)

  updateLoop = requestAnimationFrame(update)
}
watch(
  () => syncStore.timeOverwrite,
  () => {
    if (syncStore.timeOverwrite == null) return
    video.value.currentTime = syncStore.timeOverwrite
    syncStore.timeOverwrite = null
  }
)

watch(
  () => syncStore.playing,
  async () => {
    await video.value[syncStore.playing ? 'play' : 'pause']()
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

function setPlaying(value) {
  return value
  // syncStore.setPlaying(value)
}
</script>

<template>
  <div class="the-player" :class="[{ letterbox }, position]">
    <video
      v-if="sources.length > 0"
      :loop="syncStore.loop"
      autoplay
      x-muted
      ref="video"
      :style="{ width: isNaN(width) ? width : `${width}px` }"
      @durationchange="setDuration"
      @enterpictureinpicture="pip = true"
      @leavepictureinpicture="pip = false"
      @play="setPlaying(true)"
      @pause="setPlaying(false)"
      @volumechange="onVolumeChange"
      @ended="syncStore.requestNext()"
      :src="sources[0]"
    >
      <!-- <source
        v-for="(source, i) in sources"
        :key="i"
        :src="source"
        :type="`video/${source.replace(/^.*\./, '')}`"
        preload
      /> -->
    </video>
    <div v-if="$slots.default && $slots.default()" class="center"><slot></slot></div>
  </div>
</template>

<style lang="scss" scoped>
.the-player {
  video {
    width: 100%;
    height: 100%;
    display: block;

    &:picture-in-picture {
      opacity: 0;
    }
  }
  &:not(.letterbox) {
    border-radius: var(--border-radius);
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

  .center {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;
    opacity: 0;
    transition: opacity var(--transition);
    background: rgba(var(--gray-0), 0.3);

    &:hover {
      opacity: 1;
    }
  }
}
</style>
