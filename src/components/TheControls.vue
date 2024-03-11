<script setup>
import { useDataStore } from '@/stores/data'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useVideoStore } from '@/stores/video'
import { useHelperStore } from '@/stores/helper'

import IconPlay from '~icons/base/IconPlay'
import IconPlaying from '@/components/IconPlaying.vue'

const dataStore = useDataStore()
const videoStore = useVideoStore()
const helperStore = useHelperStore()

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
    <div class="graph-title">
      <IconPlay v-if="!playing" /> <IconPlaying v-else /> {{ graphTitle }}
    </div>
    <div class="progress" :style="{ width: progress }" />
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

  .graph-title {
    padding: calc(var(--spacing) / 2);
    color: color-mix(in lab, var(--graph-accent), var(--color-text) 30%);
    display: flex;
    align-items: center;
    gap: calc(var(--spacing) / 4);
    font-weight: 900;
  }

  .progress {
    position: absolute;
    height: 5px;
    background: color-mix(in lab, var(--graph-accent), var(--color-text) 30%);
    bottom: 0;
  }
}
</style>
