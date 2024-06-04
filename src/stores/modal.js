import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useDataStore } from './data'

export const useModalStore = defineStore('modal', () => {
  const show = ref(false)
  const dataStore = useDataStore()

  const node = ref(null)

  // function open(i, t) {
  //   show.value = false
  // }

  function close() {
    show.value = false
  }

  return { show, node, close }
})
