<script setup>
import { useTerminusStore } from '@/stores/terminus'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DocumentCard from './DocumentCard.vue'
import { useViewStore } from '@/stores/view'
import { MODE_VIEW } from '@/assets/js/constants'

const route = useRoute()
const router = useRouter()
const terminusStore = useTerminusStore()
const viewStore = useViewStore()

const activeGraph = computed(() => terminusStore.graphDoc)

const relatedGraphs = computed(() =>
  terminusStore.relatedGraphs.filter((graph) => graph['@id'] !== activeGraph.value['@id'])
)
</script>
<template>
  <div class="the-related-graphs" v-if="route.name === 'entity' || viewStore.mode === MODE_VIEW">
    <DocumentCard
      v-if="activeGraph['@id']"
      :document="activeGraph"
      @click="router.push(`/${activeGraph['@id']}`)"
      class="active-graph"
      is-active-graph
    />
    <template v-if="route.name === 'entity'">
      <div v-for="graph in relatedGraphs" :key="graph['@id']">
        <DocumentCard :document="graph" @click="router.push(`/${graph['@id']}`)" class="is-related-graph" />
      </div>
    </template>
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
  pointer-events: none;

  > * {
    pointer-events: all;
  }
}
</style>
