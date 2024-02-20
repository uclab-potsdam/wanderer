<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'

import { useRoute } from 'vue-router'
import { useDataStore } from '@/stores/data'

import GraphNode from '@/components/GraphNode.vue'
import GraphEdge from '@/components/GraphEdge.vue'

const route = useRoute()
const dataStore = useDataStore()

const zoomElement = ref(null)
const zoomElementSelection = ref(null)
const zoomBehaviour = ref(null)
const transform = ref({ x: 0, y: 0, k: 1 })

const id = computed(() => route.params.id)
const node = computed(() => dataStore.data.nodes[id.value])
const allocations = computed(() =>
  route.params.type === 'graph' ? node.value.allocations : computeAllocations(id.value)
)
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

watch(node, () => zoomToBounds(bounds.value))

onMounted(() => {
  zoomElementSelection.value = select(zoomElement.value)
  zoomBehaviour.value = zoom()
    .scaleExtent([0.1, 2])
    .on('zoom', (e) => {
      transform.value = e.transform
    })
  zoomElementSelection.value.call(zoomBehaviour.value)

  zoomToBounds(bounds.value)
})

function zoomToBounds(bounds, duration = 0) {
  const diff = {
    x: bounds.max.x - bounds.min.x,
    y: bounds.max.y - bounds.min.y
  }
  const scaleX = innerWidth / diff.x
  const scaleY = innerHeight / diff.y
  const scale = Math.min(scaleX, scaleY)

  const x = bounds.min.x + diff.x / 2
  const y = bounds.min.y + diff.y / 2

  zoomElementSelection.value
    .transition()
    .duration(duration)
    .call(
      zoomBehaviour.value.transform,
      zoomIdentity
        .translate(innerWidth / 2, innerHeight / 2)
        .scale(scale)
        .translate(-x, -y)
    )
}

function computeAllocations(id) {
  return {
    [id]: {
      x: 0,
      y: 0
    }
  }
}
</script>

<template>
  <main class="graph" ref="zoomElement">
    <div class="nodes" :style="{ transform: transformString }">
      <template v-for="(position, id) in allocations" :key="id">
        <GraphNode :id="id" :position="position" />
      </template>
    </div>
    <svg>
      <g :style="{ transform: transformString }">
        <template v-for="edge in edges" :key="edge.nodes.join('/')">
          <GraphEdge :edge="edge" />
        </template>
      </g>
    </svg>
  </main>
</template>

<style scoped>
.graph {
  grid-column: 1 / -1;
  grid-row: 1 / -1;
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
}
</style>
