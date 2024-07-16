<script setup>
import { useDataStore } from '@/stores/data'
import { computed, ref } from 'vue'
import { useVideoStore } from '@/stores/video'
import { useContextMenuStore } from '@/stores/contextMenu'

import DisplayDefault from '~icons/base/DisplayDefault'
import ContextMenuList from './ContextMenuList.vue'

defineProps({
  showMarkers: Boolean
})

const time = ref(0)

const dataStore = useDataStore()
const videoStore = useVideoStore()
const contextMenuStore = useContextMenuStore()

const graph = computed(() => {
  return dataStore.data.nodes[videoStore.graphId]
})

const background = computed(() => {
  const perc = `${(videoStore.time / videoStore.duration) * 100}%`
  return `linear-gradient(to right, var(--left) ${perc}, var(--right) ${perc})`
})

function setProgress(e, force) {
  if (force || !videoStore.playing) {
    videoStore.playFrom = videoStore.time =
      (e.offsetX / e.target.getBoundingClientRect().width) * videoStore.duration
  }
  if (force) saveTime()
}

function timeToPerc(t) {
  return `${(t / videoStore.duration) * 100}%`
}

function selectMarker(e, marker, force) {
  e.stopPropagation()
  if (force || !videoStore.playing) {
    videoStore.playFrom = videoStore.time = marker.time
  }
  if (force) saveTime()
}

function saveTime() {
  time.value = videoStore.time
}
function resetTime() {
  videoStore.playFrom = videoStore.time = time.value
}

function onContextMenu(e, marker, index) {
  e.preventDefault()
  e.stopPropagation()
  contextMenuStore.open(
    ContextMenuList,
    [
      {
        label: 'delete',
        action: () => {
          dataStore.data.nodes[videoStore.graphId].marker = dataStore.data.nodes[
            videoStore.graphId
          ].marker.filter((m, i) => i !== index)
        }
      },
      {
        label: '+',
        remainOpen: true,
        action: (e) => {
          e.stopPropagation()
          dataStore.data.nodes[videoStore.graphId].marker[index].time += 1
        }
      },
      {
        label: '-',
        remainOpen: true,
        action: (e) => {
          e.stopPropagation()
          dataStore.data.nodes[videoStore.graphId].marker[index].time -= 1
        }
      }
      // {
      //   label: 'edit',
      //   action: () => {
      //     // modalStore.open(props.edge.id, 'edge')
      //   }
      // }
    ],
    { x: e.x, y: e.y }
  )
}
</script>

<template>
  <div
    class="progress"
    :style="{ background }"
    @click="setProgress($event, true)"
    @mousemove="setProgress"
    @mouseenter="saveTime"
    @mouseleave="resetTime"
  >
    <div class="markers" v-if="showMarkers && graph?.marker">
      <div
        v-for="(m, i) in graph.marker"
        :key="i"
        class="marker"
        :class="{ active: m.time === videoStore.time }"
        :style="{ left: timeToPerc(m.time) }"
        @click="selectMarker($event, m, true)"
        @mousemove="selectMarker($event, m)"
        @contextmenu="onContextMenu($event, m, i)"
      >
        <DisplayDefault />
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress {
  color: var(--accent, var(--ui-accent));
  align-self: center;

  --left: color-mix(in lab, currentColor, transparent 20%);
  --right: color-mix(in lab, currentColor, rgba(255, 255, 255, 0.5) 90%);
  height: 5px;
  bottom: 0;
  width: 100%;

  backdrop-filter: var(--blur);

  display: flex;
  justify-content: center;
  align-items: center;

  .markers {
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;

    .marker {
      position: absolute;
      /* pointer-events: none; */
      transform: translate(-50%);
      mix-blend-mode: multiply;
      opacity: 0.2;
      width: 14px;
      height: 40px;
      display: grid;
      align-content: center;
      justify-content: center;

      &:hover,
      &.active {
        /* color: opacit; */
        opacity: 1;
        mix-blend-mode: normal;
        z-index: 100;
      }
      svg {
        display: block;
        pointer-events: none;
        /* transform: translate(-50%, -50%); */
        &:deep(> *) {
          pointer-events: visible;
        }
      }
    }
  }
}
</style>
