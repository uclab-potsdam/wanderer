<script setup>
import { useDataStore } from '@/stores/data'
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import GraphNode from '@/components/GraphNode.vue'

import { zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'

const dataStore = useDataStore()
const route = useRoute()

const zoomElement = ref(null)
const zoomElementSelection = ref(null)
const zoomBehaviour = ref(null)

const id = computed(() => route.params.id)
const node = computed(() => dataStore.data.nodes[id.value])

watch(node, () => zoomToBounds(bounds.value))

const allocations = computed(() =>
  route.params.type === 'graph' ? node.value.allocations : computeAllocations(id.value)
)

const transform = ref({ x: 0, y: 0, k: 1 })
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
</script>

<template>
  <main class="graph" ref="zoomElement">
    <div class="nodes" :style="{ transform: transformString }">
      <template v-for="(position, id) in allocations" :key="id">
        <GraphNode :id="id" :position="position" />
      </template>
    </div>
  </main>
</template>

<style scoped>
.graph {
  grid-column: 1 / -1;
  grid-row: 1 / -1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  .nodes {
    position: absolute;
  }
}
</style>
