<script setup>
import { useDataStore } from '@/stores/data'
import { useRoute } from 'vue-router'
import ListItem from './ListItem.vue'
import ListWrapper from './ListWrapper.vue'
import InputButton from './InputButton.vue'
import { useModalStore } from '@/stores/modal'

const dataStore = useDataStore()
const modalStore = useModalStore()

const route = useRoute()
</script>

<template>
  <main class="list">
    <nav>
      <ListWrapper horizontal equal-size>
        <InputButton tag="RouterLink" to="projects"> Projects </InputButton>
        <InputButton tag="RouterLink" to="graph"> Stories </InputButton>
        <InputButton tag="RouterLink" to="entity"> Entities </InputButton>
        <InputButton tag="RouterLink" to="image"> Images </InputButton>
      </ListWrapper>
    </nav>

    <template v-for="(node, id) in dataStore.data.nodes" :key="id">
      <ListItem
        tag="RouterLink"
        :to="{ name: 'graph', params: { type: node.type, id } }"
        v-if="node.type === route.params.type"
        :label="node.label"
        :meta="dataStore.data.nodes[node.class]?.label"
      >
        <InputButton @click.stop.prevent="modalStore.open(id, 'node')">edit</InputButton>
      </ListItem>
    </template>
  </main>
</template>

<style scoped>
.list {
  grid-column: main-start / main-end;
  grid-row: main-start / main-end;

  nav {
    margin: var(--spacing) 0;
    display: flex;
    gap: var(--spacing);
    justify-content: space-between;
  }
}
</style>
