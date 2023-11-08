<script setup>
// import { useTerminusStore } from '@/stores/terminus'
import { useSyncStore } from '@/stores/sync'
import { ref, watch, computed } from 'vue'
// import { useRoute } from 'vue-router'

defineProps({
  letterbox: Boolean,
  width: { type: [Number, String] },
  height: { type: [Number, String] },
  position: { type: String, default: 'bottom-right' }
  // sources: { Array, default: () => [] }
})

const syncStore = useSyncStore()
// const sources = ref([])
const sources = computed(() => syncStore.sources)

const video = ref(null)
const pip = ref(false)
const subtitles = ref([])
const current = ref('')

function onTimeUpdate(e) {
  const currentTime = e.target.currentTime
  syncStore.updateTime(currentTime)

  const subtitle = subtitles.value.find((d) => currentTime >= d.start && currentTime < d.end)?.text
  if (subtitle === current.value) return
  current.value = subtitle
}
watch(
  () => syncStore.forcedTime,
  () => {
    if (video.value == null || syncStore.forcedTime == null) return
    video.value.currentTime = syncStore.forcedTime
  }
)

watch(
  () => syncStore.subtitles,
  async () => {
    if (syncStore.subtitles?.value == null) return (subtitles.value = [])
    subtitles.value = await fetch(syncStore.subtitles.value)
      .then((d) => d.text())
      .then((d) => {
        const items = d
          .trim()
          .split('\n\n')
          .map((item) => {
            const keys = ['index', 'time', 'text']
            const props = Object.fromEntries(item.split('\n').map((value, i) => [keys[i], value]))
            const multipliers = [60 * 60, 60, 1]
            const start = props.time
              .replace(/ --> .*/, '')
              .replace(/,/, '.')
              .split(':')
              .reduce((a, b, i) => +a + +b * multipliers[i])
            const end = props.time
              .replace(/.* --> /, '')
              .replace(/,/, '.')
              .split(':')
              .reduce((a, b, i) => +a + +b * multipliers[i])
            return {
              start,
              end,
              text: props.text
            }
          })
        return items
      })
  },
  { immediate: true }
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

watch(
  () => video.value,
  () => {
    if (video.value == null || syncStore.forcedTime == null) return
    video.value.currentTime = syncStore.forcedTime
  }
)

function setDuration() {
  syncStore.setDuration(video.value.duration)
}
</script>

<template>
  <div class="the-player" v-if="sources.length > 0" :class="[{ letterbox }, position]">
    <video
      crossorigin="anonymous"
      :loop="syncStore.loop"
      autoplay
      controls
      ref="video"
      :style="{ width: isNaN(width) ? width : `${width}px` }"
      @durationchange="setDuration"
      @enterpictureinpicture="pip = true"
      @leavepictureinpicture="pip = false"
      @ended="syncStore.requestNext()"
      @timeupdate="onTimeUpdate"
      :src="sources[0]"
    >
      <!-- <track
        v-if="subtitles"
        kind="subtitles"
        label="Deutsch"
        :srclang="subtitles.lang"
        :src="subtitles.value"
        default
      /> -->
    </video>
    <div v-if="current" class="subtitles" :lang="syncStore.subtitles?.lang">{{ current }}</div>
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
    border-radius: var(--ui-border-radius);
    overflow: hidden;
    margin: calc(var(--spacing-s) + var(--spacing-xs));
    position: absolute;
    max-width: 90%;

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
      bottom: 47.5px;
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

  .subtitles {
    position: absolute;
    text-wrap: balance;
    font-size: max(4vw, 40px);
    color: white;
    text-shadow: -2px -2px 0 #000, 0 -2px 0 #000, 2px -2px 0 #000, 2px 0 0 #000, 2px 2px 0 #000, 0 2px 0 #000,
      -2px 2px 0 #000, -2px 0 0 #000;
    text-align: center;
    left: 20vh;
    right: 20vh;
    bottom: 5vh;
    z-index: 1;
  }

  &:not(.letterbox) {
    .subtitles {
      font-size: 20px;
      left: 20%;
      right: 20%;
      top: 5%;
    }
  }
}
</style>
