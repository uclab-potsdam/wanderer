import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useDataStore } from './data'

export const useModalStore = defineStore('modal', () => {
  const show = ref(false)
  const dataStore = useDataStore()

  const entity = computed(() => {
    if (!show.value) return null
    return dataStore.data.nodes[show.value]
  })

  function close() {
    show.value = false
  }

  return { show, entity, close }
})
