<script setup>
import InputButton from '@/components/InputButton.vue'
import { useRoute, useRouter } from 'vue-router'
import { useTerminusStore } from '@/stores/terminus'
import { ref, watch } from 'vue'
import DocumentForm from '../components/DocumentForm.vue'

const route = useRoute()
const router = useRouter()
const terminusStore = useTerminusStore()

const props = defineProps({
  type: String,
  disableRouting: Boolean
})

const emit = defineEmits(['completed'])

const document = ref({ '@type': props.type || route.params.type })

async function addDocument() {
  await terminusStore.addDocument([document.value])
  props.disableRouting ? emit('completed') : router.go(-1)
}
function cancel() {
  props.disableRouting ? emit('completed') : router.go(-1)
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
  <main>
    <DocumentForm v-model="document" />
    <div class="button-group">
      <InputButton primary @click="addDocument">Create {{ route.meta.filter }}</InputButton>
      <InputButton secondary @click="cancel">cancel</InputButton>
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

  .form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
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
