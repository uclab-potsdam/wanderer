<script setup>
import { useDataStore } from '@/stores/data'
import { computed } from 'vue'
import { useVideoStore } from '@/stores/video'
import { useHelperStore } from '@/stores/helper'

import { useSettingsStore } from '@/stores/settings'
import ListWrapper from './ListWrapper.vue'
import InputButton from './InputButton.vue'

import ControlsPlay from '~icons/base/ControlsPlay'
import ControlsPause from '~icons/base/ControlsPause'
import ControlsMarkerPrevious from '~icons/base/ControlsMarkerPrevious'
import ControlsMarkerNext from '~icons/base/ControlsMarkerNext'
import SeperatorVerical from '~icons/base/SeperatorVertical'
// import IconPlay from '~icons/base/IconPlay'

import ControlsProgress from './ControlsProgress.vue'
import { useRoute } from 'vue-router'

const dataStore = useDataStore()
const videoStore = useVideoStore()
const settingsStore = useSettingsStore()
const route = useRoute()

const graph = computed(() => {
  return dataStore.data.nodes[videoStore.graphId]
})

const color = computed(() => {
  if (graph.value?.color == null) return
  return { '--graph-accent': `var(--${graph.value.color})` }
})

const playing = computed(() => videoStore.playing)

const markers = computed(() => graph.value.marker.toSorted((a, b) => a.time - b.time))

function previous() {
  videoStore.playFrom = videoStore.time =
    markers.value.findLast((m) => m.time < videoStore.time)?.time ?? 0
}
function next() {
  videoStore.playFrom = videoStore.time =
    markers.value.find((m) => m.time > videoStore.time)?.time ?? videoStore.duration
}
</script>

<template>
  <section class="timeline" :class="{ edit: settingsStore.edit }" :style="color">
    <template v-if="settingsStore.edit && route.name === 'graph'">
      <ListWrapper class="button-group" horizontal>
        <InputButton disable-padding>
          <ControlsPlay v-if="!playing" @click="videoStore.setPlaying = true" />
          <ControlsPause v-else @click="videoStore.setPlaying = false" />
        </InputButton>
        <InputButton disable-padding><ControlsMarkerPrevious @click="previous" /></InputButton>
        <InputButton disable-padding><ControlsMarkerNext @click="next" /></InputButton>
        <SeperatorVerical />
        <ControlsProgress show-markers />
      </ListWrapper>
    </template>
    <ControlsProgress v-else />
  </section>
</template>

<style scoped>
.timeline {
  --tint: var(--accent, var(--ui-accent));

  position: absolute;
  bottom: 0;
  width: 100vw;

  z-index: 1;
  display: flex;
  align-items: flex-start;
  align-items: flex-end;
  gap: var(--spacing-half);

  --accent: color-mix(in lab, var(--graph-accent), var(--color-text) 30%);

  .button-group {
    margin: var(--spacing-half);
    width: 100%;

    .progress {
      height: 1px;
      margin: var(--spacing-half);
    }
  }
}
</style>
