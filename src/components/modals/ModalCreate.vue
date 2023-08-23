<script setup>
import ModalWrapper from '@/components/modals/ModalWrapper.vue'

import BaseButton from '@/components/BaseButton.vue'
import { useRoute } from 'vue-router'
import { useTerminusStore } from '@/stores/terminus'
import { ref, watch } from 'vue'
import DocumentForm from '@/components/DocumentForm.vue'

const route = useRoute()
const terminusStore = useTerminusStore()

const props = defineProps({
  type: String
})

const emit = defineEmits(['close', 'update'])

const document = ref({ '@type': props.type || route.params.type })

async function addDocument() {
  await terminusStore.addDocument([document.value])
  emit('close')
  emit('update')
}
function cancel() {
  emit('close')
}

// watchEffect(async () => {
//   documents.value = await terminusStore.getDocumentsByType(props.type || route.params.type)
// })
watch(
  () => props.type || route.params.type,
  () => {
    document.value['@type'] = props.type || route.params.type
  }
)
</script>

<template>
  <ModalWrapper
    @close="$emit('close')"
    show-header
    :title="`Create ${props.type || route.params.type}`"
  >
    <main>
      <DocumentForm v-model="document" />
      <div class="button-group">
        <BaseButton primary @click="addDocument"
          >create {{ props.type || route.params.type }}</BaseButton
        >
        <BaseButton secondary @click="cancel">cancel</BaseButton>
      </div>
    </main>
  </ModalWrapper>
</template>

<style lang="scss" scoped>
main {
  // margin: var(--spacing);
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
