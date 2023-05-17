<script setup>
import InputButton from '@/components/InputButton.vue'
import { useRouter, useRoute } from 'vue-router'
import { useTerminusStore } from '@/stores/terminus'
import { ref, computed, watch } from 'vue'
import DocumentForm from '../components/DocumentForm.vue'

const router = useRouter()
const route = useRoute()
const terminusStore = useTerminusStore()

const id = computed(() => `${route.params.type}/${route.params.id}`)

const document = ref({ '@type': route.params.type })

watch(
  () => id,
  async () => {
    document.value = await terminusStore.getDocument(id.value)
  },
  { immediate: true }
)

async function updateDocument() {
  await terminusStore.updateDocument([document.value])
  router.go(-1)
}

async function deleteDocument() {
  await terminusStore.deleteDocument(id.value)
  router.go(-1)
}
// const match = ref([]);
</script>

<template>
  <main>
    <DocumentForm v-model="document" />
    <div class="button-group">
      <InputButton primary @click="updateDocument">save changes</InputButton>
      <InputButton secondary @click="router.go(-1)">cancel</InputButton>
      <InputButton secondary danger @click="deleteDocument">delete</InputButton>
    </div>
  </main>
</template>

<style lang="scss" scoped>
main {
  margin: var(--spacing) var(--spacing) var(--spacing) var(--offset-left);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);

  nav {
    display: flex;
    gap: var(--spacing-l);
  }

  .button-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-s);
    margin-left: calc(var(--spacing) * -1);
  }
}
</style>
