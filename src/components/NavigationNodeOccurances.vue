<script setup>
import { useDataStore } from '@/stores/data'
const dataStore = useDataStore()
</script>

<template>
  <nav class="navigation-node-occurances">
    <RouterLink
      class="node-occurance"
      v-for="(graph, id) in dataStore.nodeOccurances"
      :key="id"
      :to="{ name: 'graph', params: { type: 'graph', id } }"
    >
      {{ graph.text.en }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.navigation-node-occurances {
  position: relative;
  grid-column: graph-start-x / graph-end-x;
  grid-row: -1 / -2;

  display: flex;
  justify-content: center;
  gap: var(--spacing);
}
</style>
