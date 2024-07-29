<script setup>
import { useDataStore } from '@/stores/data'
import { useRoute } from 'vue-router'
import ListItem from './ListItem.vue'

const dataStore = useDataStore()

const route = useRoute()
</script>

<template>
  <main class="list">
    <template v-for="(node, id) in dataStore.data.nodes" :key="id">
      <ListItem
        tag="RouterLink"
        :to="{ name: 'graph', params: { type: node.type, id } }"
        v-if="node.type === route.params.type"
        :label="node.label"
        :meta="dataStore.data.nodes[node.class]?.label"
      >
        edit
      </ListItem>
    </template>
  </main>
</template>

<style scoped>
.list {
  grid-column: main-start / main-end;
  grid-row: main-start / main-end;
}
</style>
