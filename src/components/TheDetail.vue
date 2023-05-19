<script setup>
import { useTerminusStore } from '@/stores/terminus'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const terminusStore = useTerminusStore()

const document = ref({})

watch(
  () => route.params,
  async () => {
    document.value =
      route.params.type &&
      route.params.id &&
      (await terminusStore.getDocument(`${route.params.type}/${route.params.id}`))
  },
  { immediate: true }
)
</script>

<template>
  <section>
    <pre>{{ JSON.stringify(document, null, 2) }}</pre>
  </section>
</template>

<style lang="scss" scoped></style>
