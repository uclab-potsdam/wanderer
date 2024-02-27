<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'
import { computeAllocations } from '@/assets/js/nodeAllocation'

import { useRoute } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useConstantStore } from '@/stores/constant'

import GraphNode from '@/components/GraphNode.vue'
import GraphEdge from '@/components/GraphEdge.vue'
import NavigationNodeOccurances from '@/components/NavigationNodeOccurances.vue'

const route = useRoute()
const dataStore = useDataStore()
const constantStore = useConstantStore()

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
  const values = Object.values(allocations.value)
  const valuesX = values.map(({ x }) => x)
  const valuesY = values.map(({ y }) => y)

  const xOffset = 200
  const yOffset = 100

  return {
    min: {
      x: Math.min(...valuesX) - xOffset,
      y: Math.min(...valuesY) - yOffset
    },
    max: {
      x: Math.max(...valuesX) + xOffset,
      y: Math.max(...valuesY) + yOffset
    }
  }
})
const edges = computed(() => {
  const nodes = Object.keys(allocations.value)
  return dataStore.data.edges.filter(
    (edge) => nodes.includes(edge.nodes[0]) && nodes.includes(edge.nodes[1])
  )
})

const allocationOrder = computed(() => Object.keys(allocations.value).sort())

watch(node, () => initGraph(constantStore.transition))

onMounted(() => {
  zoomElementSelection.value = select(zoomElement.value)
  zoomBehaviour.value = zoom()
    .scaleExtent([0.1, 2])
    .on('zoom', (e) => {
      transform.value = e.transform
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
    route.params.type === 'graph' ? node.value.allocations : computeAllocations(id.value)

  zoomToBounds(bounds.value, duration)
}

function zoomToBounds(bounds, duration = 0) {
  const diff = {
    x: bounds.max.x - bounds.min.x,
    y: bounds.max.y - bounds.min.y
  }

  const zoomElementDimensions = zoomElement.value.getBoundingClientRect()

  const scaleX = zoomElementDimensions.width / diff.x
  const scaleY = zoomElementDimensions.height / diff.y
  const scale = Math.min(scaleX, scaleY)

  const x = bounds.min.x + diff.x / 2
  const y = bounds.min.y + diff.y / 2

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
      zoomToBounds(bounds.value, constantStore.transition)
    }
  }
})
</script>

<template>
  <main class="graph" ref="zoomElement" :class="{ initializing: route.meta.initializeView }">
    <div class="nodes" :style="{ transform: transformString }">
      <TransitionGroup name="nodes">
        <GraphNode v-for="id in allocationOrder" :key="id" :id="id" :position="allocations[id]" />
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
  <NavigationNodeOccurances v-if="dataStore.nodeOccurances" />
</template>

<style scoped>
.graph {
  grid-column: graph-start-x / graph-end-x;
  grid-row: graph-start-y / graph-end-y;
  position: relative;
  overflow: hidden;

  &.initializing {
    --transition: 0s;
  }
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
}
</style>
