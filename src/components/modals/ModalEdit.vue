<script setup>
import ModalWrapper from '@/components/modals/ModalWrapper.vue'

import BaseButton from '@/components/BaseButton.vue'
import { useTerminusStore } from '@/stores/terminus'
import { ref, watch } from 'vue'
import DocumentForm from '@/components/DocumentForm.vue'

const props = defineProps({ id: String, type: String, show: Boolean })

// const route = useRoute()
const terminusStore = useTerminusStore()

// const id = computed(() => `${route.params.type}/${route.params.id}`)

const document = ref({ '@type': props.type })

watch(
  () => props.show,
  async () => {
    if (!props.show) return
    document.value = await terminusStore.getDocument(props.id)
  }
)

async function updateDocument() {
  await terminusStore.updateDocument([document.value])
  emit('close')
  emit('update')
}

async function deleteDocument() {
  if (props.type === 'entity') await terminusStore.deleteEntity(props.id)
  else if (props.type === 'graph') await terminusStore.deleteGraph(props.id)
  else await terminusStore.deleteDocument(props.id)
  emit('close')
  emit('update')
}
// const match = ref([]);

const emit = defineEmits(['close', 'update'])
</script>

<template>
  <ModalWrapper @close="$emit('close')" show-header title="Settings" :show="show">
    <main>
      <DocumentForm v-model="document" />
      <div class="button-group">
        <BaseButton primary @click="updateDocument">save changes</BaseButton>
        <BaseButton secondary @click="$emit('close')">cancel</BaseButton>
        <BaseButton secondary danger @click="deleteDocument">delete</BaseButton>
      </div>
    </main>
  </ModalWrapper>
</template>

<style lang="scss" scoped>
main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);

  nav {
    display: flex;
    gap: var(--spacing-l);
  }

  .button-group {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-s);
  }
}
</style>
