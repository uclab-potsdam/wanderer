<script setup>
import { useLayoutStore } from '@/stores/layout'
import { computed } from 'vue'

const layoutStore = useLayoutStore()

const props = defineProps({
  edge: Object
})

const source = computed(() => layoutStore.nodes[props.edge.nodes[0]])
const target = computed(() => layoutStore.nodes[props.edge.nodes[1]])

const d = computed(() => {
  if (source.value == null || target.value == null) return
  return `M${source.value?.x},${source.value?.y} L${target.value?.x},${target.value?.y}`
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
  <g class="edge">
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
    <path :d="d" :marker-end="markerEnd" :marker-start="markerStart" />
  </g>
</template>

<style scoped>
.edge {
  stroke: black;
  transition: d var(--transition);

  marker {
    overflow: visible;
    path {
      stroke: var(--marker);
      fill: none;
    }
  }
}
</style>
