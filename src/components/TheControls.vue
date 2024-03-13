<script setup>
import { useDataStore } from '@/stores/data'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useVideoStore } from '@/stores/video'
import { useHelperStore } from '@/stores/helper'

import IconPlay from '~icons/base/IconPlay'
import IconPlaying from '@/components/IconPlaying.vue'
import { RouterLink } from 'vue-router'
import InputSegment from '@/components/InputSegment.vue'
import { useSettingsStore } from '@/stores/settings'

const dataStore = useDataStore()
const videoStore = useVideoStore()
const helperStore = useHelperStore()
const settingsStore = useSettingsStore()

const graph = computed(() => {
  return dataStore.data.nodes[videoStore.graphId]
})

const graphTitle = computed(() => {
  if (graph.value == null) return
  return helperStore.localize(graph.value.text)
})

const color = computed(() => {
  if (graph.value?.color == null) return
  return { '--graph-accent': `var(--${graph.value.color})` }
})

const playing = computed(() => videoStore.playing)

const progress = computed(() => `${(videoStore.time / videoStore.duration) * 100}%`)
</script>

<template>
  <section class="controls" :style="color">
    <div class="wrapper">
      <RouterLink
        class="graph-title"
        :to="{ name: 'graph', params: { type: 'graph', id: videoStore.graphId } }"
      >
        <template v-if="graphTitle"
          ><IconPlay v-if="!playing" /> <IconPlaying v-else /> {{ graphTitle }}</template
        >
      </RouterLink>
      <InputSegment v-model="settingsStore.lang" :options="['pt', 'en']" />
    </div>
    <div class="progress">
      <div :style="{ width: progress }"></div>
    </div>
  </section>
</template>

<style scoped>
.controls {
  grid-column: controls-start-x / controls-end-x;
  grid-row: controls-start-y / controls-end-y;

  position: relative;

  z-index: 1;
  display: flex;
  align-items: center;

  background: color-mix(in lab, var(--color-background), transparent 50%);
  backdrop-filter: blur(20px);

  --accent: color-mix(in lab, var(--graph-accent), var(--color-text) 30%);

  .wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: calc(var(--spacing));
    .graph-title {
      padding: calc(var(--spacing) / 2);
      color: var(--accent);
      display: flex;
      align-items: center;
      gap: calc(var(--spacing) / 4);
      font-weight: 900;
      text-decoration: none;
    }
  }

  .progress {
    position: absolute;
    height: 5px;
    bottom: 0;
    width: 100%;
    background: color-mix(in lab, var(--accent), transparent 70%);

    > div {
      height: 100%;
      background: var(--accent);
    }
  }
}
</style>
