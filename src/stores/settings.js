import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const lang = ref('en')
  const mode = ref('CURATE')
  const pictureInPicture = ref(true)

  return { lang, mode, pictureInPicture }
})
