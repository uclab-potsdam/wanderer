<script setup>
import { useDataStore } from '@/stores/data'
import { useRoute, useRouter } from 'vue-router'

const dataStore = useDataStore()
const route = useRoute()
const router = useRouter()
</script>

<template>
  <main class="list">
    <template v-for="(node, id) in dataStore.data.nodes" :key="id">
      <RouterLink
        :to="{ name: 'graph', params: { type: node.type, id } }"
        v-if="node.type === route.params.type"
      >
        <div>
          {{ node.text?.en ?? 'untitled' }}
        </div>
      </RouterLink>
    </template>
  </main>
</template>

<style scoped>
.list {
  grid-column: center-start / center-end;
  grid-row: center-start / center-end;
}
</style>
