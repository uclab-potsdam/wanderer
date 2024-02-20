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
</script>

<template>
  <path class="edge" :d="d" />
</template>

<style scoped>
.edge {
  stroke: black;
}
</style>
