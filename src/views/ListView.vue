<script setup>
import { watch, ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useTerminusStore } from '@/stores/terminus'

import DocumentList from '../components/DocumentList.vue'
import TheSearch from '../components/TheSearch.vue'

const props = defineProps({ type: String, singleColumn: Boolean })

const route = useRoute()
const terminusStore = useTerminusStore()

// const type = computed(() => props.type || route.params.type)

// console.log(type.value)

const documents = ref([])
const results = ref(null)

const items = computed(() => results.value ?? documents.value)
// watch(
//   () => route.params.type,
//   async (type) => {
//     documents.value = await terminusStore.getDocumentsByType(type)
//   },
//   { immediate: true }
// )

watchEffect(async () => {
  documents.value = await terminusStore.getDocumentsByType(props.type || route.params.type)
})

function onUpdateResults(d) {
  results.value = d
}
</script>

<template>
  <main>
    <TheSearch :type="type || route.params.type" @update-results="onUpdateResults" />
    <DocumentList :documents="items" :single-column="singleColumn" />
  </main>
</template>

<style lang="scss" scoped></style>
