<script setup>
import { watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useTerminusStore } from '@/stores/terminus'

import DocumentList from '../components/DocumentList.vue'

const route = useRoute()
const terminusStore = useTerminusStore()

const documents = ref([])
watch(
  () => route.params.type,
  async (type) => {
    documents.value = await terminusStore.getDocumentsByType(type)
  },
  { immediate: true }
)
</script>

<template>
  <main>
    <DocumentList :documents="documents" />
  </main>
</template>

<style lang="scss" scoped></style>
