<script setup>
import { useSyncStore } from '@/stores/sync'
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'
import { computed, onMounted, ref } from 'vue'
import { formatTime } from '@/assets/js/utils'

import IconPlay from '~icons/default/Play'
import IconPause from '~icons/default/Pause'

import BaseButton from '@/components/BaseButton.vue'
import BaseButtonGroup from '../BaseButtonGroup.vue'

const props = defineProps({ persistent: Boolean, scrubbing: Boolean, mark: Boolean })

const syncStore = useSyncStore()
const terminusStore = useTerminusStore()
const viewStore = useViewStore()

const formattedTime = computed(() => formatTime(syncStore.time))

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
    syncStore.forceTime(userTime.value)
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
  syncStore.forceTime(time ?? userTime.value)
  if (props.scrubbing && !syncStore.playing) {
    storedTime = time ?? userTime.value
  }
}

function togglePlay() {
  syncStore.togglePlay()
}

const showControls = computed(() => props.persistent || !viewStore.inactivityShort)

async function onKeyDown({ code, altKey, shiftKey }) {
  const amount = shiftKey ? 10 : altKey ? 1 / syncStore.framerate : 1
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
    case 'ArrowUp':
      if (syncStore.atMarker) {
        await updateMarker(syncStore.time + amount)
        setProgress(syncStore.time + amount)
      }
      break
    case 'ArrowDown':
      if (syncStore.atMarker) {
        await updateMarker(syncStore.time - amount)
        setProgress(syncStore.time - amount)
      }
      break
    case 'KeyM':
      toggleMarker()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

function addMarker() {
  if (!props.mark) return
  terminusStore.addMarker(syncStore.time)
}

function updateMarker(time) {
  if (!props.mark) return
  terminusStore.updateMarker(syncStore.atMarker, time)
}

function deleteMarker() {
  if (!props.mark) return
  terminusStore.deleteMarker(syncStore.atMarker['@id'])
}

function toggleMarker() {
  syncStore.atMarker ? deleteMarker() : addMarker()
}

function seekBackward() {
  const previous = syncStore.atMarker
    ? terminusStore.markers.findLast((marker) => marker.timestamp < (syncStore.activeMarker?.timestamp || 0))
    : syncStore.activeMarker
  syncStore.forceTime(previous?.timestamp ?? 0)
}

function seekForward() {
  const next = terminusStore.markers.find((marker) => marker.timestamp > (syncStore.activeMarker?.timestamp || 0))
  syncStore.forceTime(next?.timestamp ?? syncStore.duration - 1 / syncStore.framerate)
}
</script>

<template>
  <Transition name="default">
    <BaseButtonGroup class="controls-media" v-if="showControls">
      <BaseButton @click="togglePlay" small control>
        <IconPause v-if="syncStore.playing" /><IconPlay v-else />
      </BaseButton>
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
            @click.stop="setProgress(marker.timestamp)"
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
        <!-- <div v-if="mark" class="mark">
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
        </div> -->
        <div class="time">{{ formattedTime }}</div>
      </div>
    </BaseButtonGroup>
  </Transition>
</template>

<style scoped lang="scss">
.controls-media {
  // position: absolute;
  display: grid;
  grid-template-columns: auto 1fr auto;
  // gap: var(--spacing-xs);
  width: 100%;
  // background: black;
  bottom: 0px;
  font-size: var(--font-size-s);
  // font-weight: var(--medium);

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
  .progress-bar {
    // padding: 0 var(--spacing);
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

      pointer-events: all;

      &:hover {
        border-color: var(--accent);
        background-color: var(--accent);
      }

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
    padding: 0 var(--spacing);
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
