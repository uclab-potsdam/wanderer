<script setup>
import { useSyncStore } from '@/stores/sync'
import { useTerminusStore } from '@/stores/terminus'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import IconPlay from '~icons/default/Play'
import IconPause from '~icons/default/Pause'
import IconMute from '~icons/default/Mute'
import IconUnmute from '~icons/default/Unmute'

import IconSeekBack from '~icons/default/SeekBack'
import IconSeekForward from '~icons/default/SeekForward'
import IconMarkerAdd from '~icons/default/MarkerAdd'
import IconMarkerRemove from '~icons/default/MarkerRemove'
import BaseButton from './BaseButton.vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const framerate = 23.98

const props = defineProps({ persistent: Boolean, scrubbing: Boolean, mark: Boolean })

const syncStore = useSyncStore()
const terminusStore = useTerminusStore()

const formattedTime = computed(() => formatTime(syncStore.time))

watch(
  () => terminusStore.graphDoc.next,
  () => {
    syncStore.setLoop(terminusStore.graphDoc.next == null)
  },
  { immediate: true }
)

watch(
  () => syncStore.next,
  () => {
    if (route.name !== 'screen' || terminusStore.graphDoc.next == null) return
    router.push({
      params: {
        type: terminusStore.graphDoc.next.split('/')[0],
        id: terminusStore.graphDoc.next.split('/')[1]
      }
    })
  }
)
// const atMarker = computed(() =>
//   terminusStore.markers.find((marker) => {
//     return Math.abs(syncStore.time - marker.timestamp) <= 1 / framerate / 2
//   })
// )

// const timestamps = computed(() => {
//   return dataStore.currentEntityTimestamps.map((timestamp) => {
//     return {
//       ...timestamp,
//       progress: timestamp.in / syncStore.duration,
//       duration: (timestamp.out - timestamp.in) / syncStore.duration
//     }
//   })
// })

function formatTime(seconds) {
  const s = `${Math.floor(seconds) % 60}`.padStart(2, 0)
  const m = `${Math.floor(seconds / 60) % 60}`.padStart(2, 0)
  const totalHours = Math.floor(syncStore.duration / 60 / 60)
  const h = `${Math.floor(seconds / 60 / 60)}`.padStart(`${totalHours}`.length, 0)
  return totalHours > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
}

const userProgress = ref(null)
const userTime = ref(null)
const userLabel = ref(null)
const formattedUserTime = ref(null)
const progressBarWidth = ref(0)
const progressBarX = ref(0)

let storedTime = null

function initProgress(e) {
  progressBarWidth.value = e.target.getBoundingClientRect().width
  progressBarX.value = e.target.getBoundingClientRect().x
  if (props.scrubbing && !syncStore.playing) {
    storedTime = syncStore.time
  }
}

function showProgress(e) {
  userProgress.value = (e.clientX - progressBarX.value) / progressBarWidth.value
  userTime.value = Math.max(0, userProgress.value * syncStore.duration)
  formattedUserTime.value = formatTime(userTime.value)
  if (props.scrubbing && !syncStore.playing) {
    syncStore.setTime(userTime.value)
  }
  // userLabel.value = timestamps.value.find(
  //   (timestamp) => timestamp.in <= userTime.value && timestamp.out > userTime.value
  // )?.label
}

function hideProgress() {
  userProgress.value = null
  userLabel.value = null
  if (props.scrubbing && !syncStore.playing) {
    setProgress(storedTime)
  }
}

function setProgress(time) {
  syncStore.setTime(time ?? userTime.value)
  if (props.scrubbing && !syncStore.playing) {
    storedTime = time ?? userTime.value
  }
}

function togglePlay() {
  syncStore.togglePlay()
}
function toggleMute() {
  syncStore.toggleMute()
}

let userInteractedTimeout = null
const showControls = ref(true)

function userInteracted() {
  showControls.value = true
  clearTimeout(userInteractedTimeout)
  if (!props.persistent) {
    userInteractedTimeout = setTimeout(() => {
      showControls.value = false
    }, 2500)
  }
}

function onKeyDown({ code, altKey, shiftKey }) {
  const amount = shiftKey ? 30 : altKey ? 1 / framerate : 5
  switch (code) {
    case 'Space':
      togglePlay()
      break
    case 'ArrowLeft':
      if (shiftKey && props.mark) seekBackward()
      else setProgress(syncStore.time - amount)
      break
    case 'ArrowRight':
      if (shiftKey && props.mark) seekForward()
      else setProgress(syncStore.time + amount)
      break
    case 'KeyM':
      toggleMarker()
      break
  }
  userInteracted()
}

onMounted(() => {
  syncStore.requestDuration()
  window.addEventListener('mousemove', userInteracted)
  window.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => {
  window.removeEventListener('mousemove', userInteracted)
  userInteracted()
})

function addMarker() {
  if (!props.mark) return
  terminusStore.addMarker(syncStore.time)
}

function deleteMarker() {
  if (!props.mark) return
  terminusStore.deleteMarker(syncStore.atMarker['@id'])
}

function toggleMarker() {
  syncStore.atMarker ? deleteMarker() : addMarker()
}

function seekBackward() {
  const previous = terminusStore.markers.reduce((a, b) => {
    if (b.timestamp >= syncStore.time) return a
    if (a == null) return b
    if (Math.abs(a.timestamp - syncStore.time) < Math.abs(b.timestamp - syncStore.time)) return a
    return b
  }, null)
  setProgress(previous?.timestamp ?? 0)
}

function seekForward() {
  const previous = terminusStore.markers.reduce((a, b) => {
    if (b.timestamp <= syncStore.time) return a
    if (a == null) return b
    if (Math.abs(a.timestamp - syncStore.time) < Math.abs(b.timestamp - syncStore.time)) return a
    return b
  }, null)
  setProgress(previous?.timestamp ?? syncStore.duration - 1 / framerate)
}
</script>

<template>
  <Transition name="default">
    <div class="controls" v-if="showControls">
      <div class="button-group">
        <BaseButton @click="togglePlay">
          <IconPause v-if="syncStore.playing" /><IconPlay v-else />
        </BaseButton>
        <BaseButton @click="toggleMute">
          <IconMute v-if="syncStore.mute" /><IconUnmute v-else />
        </BaseButton>
      </div>
      <div
        class="progress-bar"
        @mousemove="showProgress"
        @mouseenter="initProgress"
        @click="setProgress()"
        @mouseleave="hideProgress"
      >
        <div class="backdrop" />
        <div class="progress" :style="{ left: `${syncStore.progress * 100}%` }" />
        <div
          class="user-time"
          :class="{ 'has-label': userLabel }"
          v-if="userProgress"
          :style="{ left: `${userProgress * 100}%` }"
        >
          <div class="value label">{{ userLabel }}</div>
          <div class="value">{{ formattedUserTime }}</div>
          <div class="tick" />
        </div>
        <!-- <div class="markers" v-if="mark"> -->
        <template v-if="mark">
          <div
            class="marker"
            v-for="marker in terminusStore.markers"
            :key="marker['@id']"
            :class="{ active: syncStore.atMarker?.['@id'] === marker['@id'] }"
            :style="{ left: `${(marker.timestamp / syncStore.duration) * 100}%` }"
          ></div>
        </template>
        <!-- </div> -->
        <!-- <div class="timestamps">
        <div
          class="timestamp"
          v-for="(ts, i) in timestamps"
          :key="i"
          :style="{ left: `${ts.progress * 100}%` }"
          :class="{ active: ts.active }"
          @click.stop="setProgress(ts.time)"
        />
      </div> -->
        <div class="timeranges">
          <!-- <div
            class="timerange"
            v-for="(ts, i) in timestamps"
            :key="i"
            :style="{ left: `${ts.progress * 100}%`, width: `${ts.duration * 100}%` }"
            :class="{ active: ts.active }"
            @click.stop="setProgress(ts.in)"
          > -->
          <div class="inner" />
          <!-- </div> -->
        </div>
      </div>
      <div class="controls-end">
        <div v-if="mark" class="mark">
          <BaseButton>
            <IconSeekBack @click="seekBackward" />
          </BaseButton>
          <BaseButton v-if="syncStore.atMarker == null" @click="addMarker">
            <IconMarkerAdd />
          </BaseButton>
          <BaseButton v-else @click="deleteMarker">
            <IconMarkerRemove />
          </BaseButton>
          <BaseButton>
            <IconSeekForward @click="seekForward" />
          </BaseButton>
        </div>
        <div class="time">{{ formattedTime }}</div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.controls {
  position: absolute;
  display: grid;
  grid-template-columns: auto 1fr auto;
  padding: var(--spacing-l);
  gap: var(--spacing-l);
  width: 100vw;
  height: 62px;
  // background: black;
  bottom: 0px;
  font-size: var(--font-size-s);
  font-weight: var(--medium);

  > div {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    color: var(--primary);
    // font-weight: var(--bold);
    // background: red;
  }

  .button-group {
    gap: var(--spacing);
    > div {
      &:hover {
        color: var(--accent);
      }
      color: var(--primary);
      transition: color 0.2s;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      // width: 24px;
      // height: 24px;
      // border: 1.5px solid currentColor;
      border-radius: 50%;
    }
  }
  .progress-bar {
    position: relative;
    cursor: default;
    > div {
      pointer-events: none;
      position: absolute;
    }
    .backdrop {
      height: 2px;
      width: 100%;
      border-radius: 1px;
      background: var(--primary);
      outline: 1px solid var(--secondary);
    }
    .progress {
      height: 16px;
      width: 2px;
      border-radius: 1px;
      background: var(--primary);
      transform: translateX(-50%);
      z-index: 5;
      // opacity: 0.4;
    }
    .user-time {
      transform: translate(-50%, -24px);
      display: flex;
      // justify-content: center;
      align-items: top;
      // color: rgb(var(--teal-5));
      z-index: 5;
      .tick {
        position: absolute;
        width: 2px;
        height: 32px;
        // top: 15px;
        background: currentColor;
      }
      .value {
        position: absolute;
        margin-left: var(--spacing-s);
        font-feature-settings: 'tnum';

        &.label {
          white-space: nowrap;
          transform: translate(0, -100%);
        }
      }
      &.has-label {
        .tick {
          height: 48px;
          transform: translateY(-16px);
        }
      }
    }
    .timestamps {
      position: absolute;
      width: 100%;
      .timestamp {
        pointer-events: all;
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgb(var(--teal-10));
        transform: translate(-50%, 50%);
        transition: transform 0.2s, background 0.2s;

        &:hover {
          transform: translate(-50%, 50%) scale(1.4);
          background: rgb(var(--teal-8));
        }

        &.active {
          background: rgb(var(--teal-5));

          &:hover {
            background: rgb(var(--teal-3));
          }
        }
      }
    }
    .timeranges {
      position: absolute;
      width: 100%;
      .timerange {
        pointer-events: all;
        position: absolute;
        // width: 8px;
        height: 24px;
        // border-radius: 50%;
        // opacity: 0.5;
        // background: rgb(var(--red-9));
        transform: translate(0, -50%);
        transition: transform 0.1s, background 0.2s;
        display: flex;
        align-items: center;
        // justify-content: center;

        &:hover {
          .inner {
            transform: scale(1, 1.4);
            background: rgb(var(--teal-7));
          }
        }

        &.active {
          .inner {
            background: rgb(var(--teal-5));
          }

          &:hover {
            .inner {
              background: rgb(var(--teal-3));
            }
          }
        }

        .inner {
          width: 100%;
          height: 8px;
          position: absolute;
          // border-radius: 50%;
          // opacity: 0.5;
          background: rgb(var(--teal-9));
          // transform: translate(0, -50%);
          transition: transform 0.1s, background 0.2s;

          &.active {
            background: rgb(var(--teal-5));

            &:hover {
              background: rgb(var(--teal-3));
            }
          }
        }
      }
    }
    &:hover {
      .progress {
        display: none;
      }
    }

    .marker {
      position: absolute;
      width: 7px;
      height: 7px;
      border: 1px solid var(--primary);
      transform: translateX(-50%) rotate(45deg);
      background: var(--secondary);
      outline: 1px solid var(--secondary);
      z-index: 10;

      &.active {
        border-color: var(--accent);
        background-color: var(--accent);
      }
    }
  }

  .controls-end {
    gap: var(--spacing-l);
    .mark {
      display: flex;
    }
  }
  .time {
    justify-content: flex-end;
    font-feature-settings: 'tnum';
  }

  &.default-enter-active,
  &.default-leave-active {
    transition: all 0.2s ease;
  }
  &.default-enter-from,
  &.default-leave-to {
    opacity: 0;
  }
}
</style>
