import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', () => {
  const nodes = ref({})
  const offset = ref({ x: 0, y: 0 })
  const transform = ref({ x: 0, y: 0, k: 1 })

  return { nodes, offset, transform }
})
