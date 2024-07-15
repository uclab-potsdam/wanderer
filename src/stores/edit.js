import { ref, watchEffect } from 'vue'
import { defineStore } from 'pinia'

export const useEditStore = defineStore('edit', () => {
  const mode = ref('default')

  function resetMode() {
    mode.value = 'default'
  }

  return { mode, resetMode }
})
