<script setup>
import { useDataStore } from '@/stores/data'
import { useContextMenuStore } from '@/stores/contextMenu'
import { useLayoutStore } from '@/stores/layout'
import SearchableList from './SearchableList.vue'

defineProps({
  context: {
    type: Object,
    default: () => ({
      nodeType: 'entity'
    })
  }
})
const dataStore = useDataStore()
const contextMenuStore = useContextMenuStore()
const layoutStore = useLayoutStore()

function addNode(id) {
  if (dataStore.data.nodes[dataStore.nodeId].allocations == null) {
    dataStore.data.nodes[dataStore.nodeId].allocations = {}
  }
  dataStore.data.nodes[dataStore.nodeId].allocations[id] = {
    x: (contextMenuStore.offset.x - layoutStore.transform.x) / layoutStore.transform.k,
    y: (contextMenuStore.offset.y - layoutStore.transform.y) / layoutStore.transform.k
  }
}
</script>

<template>
  <SearchableList @select-item="addNode" :context="context" />
</template>

<style scoped></style>
