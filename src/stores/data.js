import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useDataStore = defineStore('data', () => {
  const data = ref({})

  async function init() {
    data.value = await fetch('/db.json').then((d) => d.json())
  }

  init()
  return { data }
})
