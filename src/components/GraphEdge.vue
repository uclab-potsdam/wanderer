<script setup>
import { computed } from 'vue'
import { getLineRoundedRectangleIntersection } from '@/assets/js/intersection'

import { useLayoutStore } from '@/stores/layout'
import { useDisplayStore } from '@/stores/display'
import { useActivityStore } from '@/stores/activity'
import { useConstantStore } from '@/stores/constant'
import { useVideoStore } from '@/stores/video'
import { useDataStore } from '@/stores/data'

import BaseInterpolate from '@/components/BaseInterpolate.vue'

const layoutStore = useLayoutStore()
const displayStore = useDisplayStore()
const activityStore = useActivityStore()
const constantStore = useConstantStore()
const videoStore = useVideoStore()
const dataStore = useDataStore()

const props = defineProps({
  edge: Object
})

const source = computed(() => layoutStore.nodes[props.edge.nodes[0]])
const target = computed(() => layoutStore.nodes[props.edge.nodes[1]])

const occurances = computed(() => {
  const predicate =
    dataStore.data.nodes[props.edge.nodes[0]].type === 'predicate'
      ? props.edge.nodes[0]
      : dataStore.data.nodes[props.edge.nodes[1]].type === 'predicate'
        ? props.edge.nodes[1]
        : null
  if (predicate === null) return
  return dataStore.graphs.filter((d) =>
    Object.prototype.hasOwnProperty.call(d.allocations, predicate)
  )
})

const color = computed(() => {
  if (
    occurances.value == null ||
    occurances.value.length === 0 ||
    occurances.value[0].color == null
  )
    return
  return { '--graph-accent': `var(--${occurances.value[0].color})` }
})

const display = computed(() => displayStore.inheritStateFromNodes(props.edge.nodes))

const d = computed(() => {
  if (source.value == null || target.value == null) return

  const margin = constantStore.spacing
  const radius = constantStore.spacing

  const sourceWidth = source.value.width + margin
  const sourceHeight = source.value.height + margin
  const targetWidth = target.value.width + margin
  const targetHeight = target.value.height + margin

  const start = getLineRoundedRectangleIntersection(
    source.value.x,
    source.value.y,
    target.value.x,
    target.value.y,
    source.value.x - sourceWidth / 2,
    source.value.y - sourceHeight / 2,
    sourceWidth,
    sourceHeight,
    Math.min(radius, sourceHeight / 2 - 0.1) // fix issue when radius >= height / 2
  )[0]

  const end = getLineRoundedRectangleIntersection(
    source.value.x,
    source.value.y,
    target.value.x,
    target.value.y,
    target.value.x - targetWidth / 2,
    target.value.y - targetHeight / 2,
    targetWidth,
    targetHeight,
    Math.min(radius, targetHeight / 2 - 0.1) // fix issue when radius >= height / 2
  )[0]

  if (start == null || end == null) {
    return
  }
  return `M${start[0]},${start[1]} L${end[0]},${end[1]}`
})

const id = computed(() => props.edge.nodes.join('-'))
const markerId = computed(() => `url('#marker-${id.value}')`)
const markerEnd = computed(
  () => (props.edge.arrow === '→' || props.edge.arrow === '↔') && markerId.value
)
const markerStart = computed(
  () => (props.edge.arrow === '←' || props.edge.arrow === '↔') && markerId.value
)
</script>

<template>
  <g
    class="edge"
    :class="[display, { 'user-active': !activityStore.inactivityShort || !videoStore.playing }]"
    :style="color"
  >
    <defs>
      <marker
        :id="`marker-${id}`"
        markerWidth="10"
        markerHeight="20"
        refX="10"
        refY="10"
        orient="auto"
      >
        <path d="M0,0 L10,10 L0,20" />
      </marker>
    </defs>
    <BaseInterpolate
      :props="{
        d
      }"
      :delay="0"
      :duration="constantStore.transition"
      v-slot="value"
    >
      <path :d="value.d" :marker-end="markerEnd" :marker-start="markerStart" />
    </BaseInterpolate>
  </g>
</template>

<style scoped>
.edge {
  stroke: var(--graph-accent);

  &.hide {
    opacity: 0;

    &.user-active {
      opacity: 0.6;
    }
  }

  &.highlight {
    stroke: red;
  }

  marker {
    overflow: visible;
    path {
      stroke: var(--marker);
      fill: none;
    }
  }

  path {
    /* transition: d var(--transition); */
  }
}
</style>
