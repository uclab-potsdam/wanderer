<script setup>
import { useDataStore } from '@/stores/data'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  id: String,
  position: Object
})

const dataStore = useDataStore()

const node = computed(() => dataStore.data.nodes[props.id])
const positioning = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`
}))
</script>

<template>
  <RouterLink
    :to="{ name: 'graph', params: { type: node.type, id } }"
    class="node"
    :style="positioning"
  >
    {{ node?.text?.en }}
  </RouterLink>
</template>

<style scoped>
.node {
  position: absolute;
  transform: translate(-50%, -50%);
}
</style>
