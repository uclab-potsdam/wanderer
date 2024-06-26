<script setup>
import { useDataStore } from '@/stores/data'
import { useHelperStore } from '@/stores/helper'
import { useRoute } from 'vue-router'
import ListItem from './ListItem.vue'

const dataStore = useDataStore()
const helperStore = useHelperStore()

const route = useRoute()
</script>

<template>
  <main class="list">
    <template v-for="(node, id) in dataStore.data.nodes" :key="id">
      <ListItem
        tag="RouterLink"
        :to="{ name: 'graph', params: { type: node.type, id } }"
        v-if="node.type === route.params.type"
        :label="node.text"
        :meta="node.class"
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
