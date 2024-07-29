import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useDataStore } from './data'

export const useModalStore = defineStore('modal', () => {
  const show = ref(false)
  const dataStore = useDataStore()

  const id = ref(null)
  const type = ref(null)
  const item = computed(() => {
    switch (type.value) {
      case 'node':
        return dataStore.data.nodes[id.value]
      case 'edge':
        return dataStore.data.edges.find((e) => e.id === id.value)
      default:
        return null
    }
  })

  function open(i, t) {
    id.value = i
    type.value = t
    show.value = true
  }

  function close() {
    show.value = false
  }

  return { show, item, close, open, type, id }
})
