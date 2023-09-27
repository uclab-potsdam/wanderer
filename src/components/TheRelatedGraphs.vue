<script setup>
import { useTerminusStore } from '@/stores/terminus'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DocumentCard from './DocumentCard.vue'

const route = useRoute()
const router = useRouter()
const terminusStore = useTerminusStore()

const activeGraph = computed(() => terminusStore.graphDoc)

const relatedGraphs = computed(() =>
  terminusStore.relatedGraphs.filter((graph) => graph['@id'] !== activeGraph.value['@id'])
)
</script>
<template>
  <div class="the-related-graphs" v-if="route.name === 'entity'">
    <DocumentCard
      v-if="activeGraph['@id']"
      :document="activeGraph"
      @click="router.push(`/${activeGraph['@id']}`)"
      class="active-graph"
    />
    <div v-for="graph in relatedGraphs" :key="graph['@id']">
      <DocumentCard :document="graph" @click="router.push(`/${graph['@id']}`)" />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.the-related-graphs {
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  display: flex;
  justify-items: flex-start;
  padding: var(--spacing);
  gap: var(--spacing);
}
</style>
