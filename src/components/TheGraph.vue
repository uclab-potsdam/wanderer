<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'
import { computeAllocations } from '@/assets/js/nodeAllocation'

import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useConstantStore } from '@/stores/constant'
import { useDisplayStore } from '@/stores/display'
import { useActivityStore } from '@/stores/activity'
import { useVideoStore } from '@/stores/video'

import GraphNode from '@/components/GraphNode.vue'
import GraphEdge from '@/components/GraphEdge.vue'
import { useLayoutStore } from '@/stores/layout'

const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()
const constantStore = useConstantStore()
const displayStore = useDisplayStore()
const activityStore = useActivityStore()
const videoStore = useVideoStore()
const layoutStore = useLayoutStore()

const allocations = ref([])

const zoomElement = ref(null)
const zoomElementSelection = ref(null)
const zoomBehaviour = ref(null)
const transform = ref({ x: 0, y: 0, k: 1 })

const id = computed(() => route.params.id)
const node = computed(() => dataStore.data.nodes[id.value])

const transformString = computed(
  () => `translate(${transform.value.x}px, ${transform.value.y}px) scale(${transform.value.k})`
)
const bounds = computed(() => {
  if (displayStore.bounds != null)
    // return displayStore.bounds
    return {
      x1: displayStore.bounds.x1 + layoutStore.offset.x,
      y1: displayStore.bounds.y1 + layoutStore.offset.y,
      x2: displayStore.bounds.x2 + layoutStore.offset.x,
      y2: displayStore.bounds.y2 + layoutStore.offset.y
    }
  const values = Object.values(allocations.value)
  const valuesX = values.map(({ x }) => x)
  const valuesY = values.map(({ y }) => y)

  const xOffset = 200
  const yOffset = 100

  return {
    x1: Math.min(...valuesX) - xOffset,
    y1: Math.min(...valuesY) - yOffset,
    x2: Math.max(...valuesX) + xOffset,
    y2: Math.max(...valuesY) + yOffset
  }
})
const edges = computed(() => {
  const nodes = Object.keys(allocations.value)
  return dataStore.data.edges.filter(
    (edge) => nodes.includes(edge.nodes[0]) && nodes.includes(edge.nodes[1])
  )
})

const allocationOrder = computed(() => Object.keys(allocations.value).sort())
const cssProps = computed(() => {
  if (node.value.color == null) return
  return { '--graph-accent': `var(--${node.value.color})` }
})
watch(node, () => initGraph(constantStore.transition))

watch(bounds, () => {
  if (!activityStore.inactivityShort) return
  zoomToBounds(bounds.value, constantStore.transition)
})

watch(
  () => activityStore.inactivityShort,
  () => {
    if (!videoStore.playing) return
    zoomToBounds(bounds.value, constantStore.transition)
  }
)

watch(
  () => activityStore.inactivityLong,
  () => {
    if (!videoStore.playing) return
    if (route.name === 'graph' && route.params.type !== 'graph' && videoStore.graphId != null) {
      router.push({ name: 'graph', params: { type: 'graph', id: videoStore.graphId } })
    }
  }
)

onMounted(() => {
  zoomElementSelection.value = select(zoomElement.value)
  zoomBehaviour.value = zoom()
    .scaleExtent([0.1, 2])
    .on('zoom', (e) => {
      transform.value = e.transform
    })
    .filter((e) => {
      console.log(e.type)
      nextTick(() => activityStore.registerActivity())
      return true
    })
  zoomElementSelection.value.call(zoomBehaviour.value)
  initGraph(0)
  resizeObserver.observe(zoomElement.value)
})

onBeforeUnmount(() => {
  if (zoomElement.value != null) resizeObserver.unobserve(zoomElement.value)
})

function initGraph(duration) {
  allocations.value =
    route.params.type === 'graph' ? translate(node.value.allocations) : computeAllocations(id.value)

  zoomToBounds(bounds.value, duration)
}

function translate(allocations) {
  return Object.fromEntries(
    Object.entries(allocations ?? {}).map((allocation) => [
      allocation[0],
      {
        ...allocation[1],
        x: allocation[1].x + layoutStore.offset.x,
        y: allocation[1].y + layoutStore.offset.y
      }
    ])
  )
}

function zoomToBounds(bounds, duration = 0) {
  const diff = {
    x: bounds.x2 - bounds.x1,
    y: bounds.y2 - bounds.y1
  }

  const zoomElementDimensions = zoomElement.value.getBoundingClientRect()

  const scaleX = zoomElementDimensions.width / diff.x
  const scaleY = (zoomElementDimensions.height - constantStore.spacing * 2.7) / diff.y
  const scale = Math.min(scaleX, scaleY)

  const x = bounds.x1 + diff.x / 2
  const y = bounds.y1 + diff.y / 2

  zoomElementSelection.value
    .transition()
    .duration(duration)
    .call(
      zoomBehaviour.value.transform,
      zoomIdentity
        .translate(zoomElementDimensions.width / 2, zoomElementDimensions.height / 2)
        .scale(scale)
        .translate(-x, -y)
    )
}

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.contentRect) {
      zoomToBounds(bounds.value, 0)
    }
  }
})
</script>

<template>
  <main
    class="graph"
    ref="zoomElement"
    :class="{ initializing: route.meta.initializeView }"
    :style="cssProps"
  >
    <div class="nodes" :style="{ transform: transformString }">
      <TransitionGroup name="nodes">
        <GraphNode
          v-for="id in allocationOrder"
          :key="id"
          :id="id"
          :position="allocations[id]"
          :transform="transform"
        />
      </TransitionGroup>
    </div>
    <svg>
      <g :style="{ transform: transformString }">
        <TransitionGroup name="edges">
          <GraphEdge v-for="edge in edges" :key="edge.nodes.join('/')" :edge="edge" />
        </TransitionGroup>
      </g>
    </svg>
  </main>
  <div class="tint" />
</template>

<style scoped>
.graph {
  grid-column: graph-start-x / graph-end-x;
  grid-row: graph-start-y / graph-end-y;
  position: relative;
  overflow: hidden;

  /* position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh; */

  .nodes {
    position: absolute;
  }
  svg {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  /* transitions */
  .nodes-enter-active {
    transition: opacity var(--transition) var(--transition);
  }
  .nodes-leave-active {
    transition: opacity var(--transition);
  }

  .edges-enter-active {
    transition: opacity var(--transition) var(--transition);
  }
  .edges-leave-active {
    transition: opacity var(--transition);
  }

  .edges-enter-from,
  .nodes-enter-from,
  .edges-leave-to,
  .nodes-leave-to {
    opacity: 0;
  }

  &.initializing {
    .nodes-enter-active,
    .edges-enter-active {
      transition: opacity var(--transition);
    }
  }
}
.tint {
  transition: all var(--transition);
  /* position: absolute; */
  grid-column: graph-start-x / graph-end-x;
  grid-row: graph-start-y / graph-end-y;
  background: var(--graph-accent);
  opacity: 0.05;
  pointer-events: none;
  z-index: 5;
}
</style>
