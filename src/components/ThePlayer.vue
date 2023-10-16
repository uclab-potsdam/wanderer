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
const subtitles = computed(() => syncStore.subtitles)

const video = ref(null)
const pip = ref(false)

function onTimeUpdate(e) {
  syncStore.updateTime(e.target.currentTime)
}
watch(
  () => syncStore.forcedTime,
  () => {
    if (video.value == null || syncStore.forcedTime == null) return
    video.value.currentTime = syncStore.forcedTime
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
      <track
        v-if="subtitles"
        kind="subtitles"
        label="Deutsch"
        :srclang="subtitles.lang"
        :src="subtitles.value"
        default
      />
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
    border-radius: var(--ui-border-radius);
    overflow: hidden;
    margin: calc(var(--spacing-s) + var(--spacing-xs));
    position: absolute;
    max-width: 90%;
    // box-shadow: 2px 2px 5px var(--shadow);
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
}
</style>
