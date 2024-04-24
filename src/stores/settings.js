import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const lang = ref('en')
  const mode = ref('CURATE')
  const edit = ref(false)
  const pictureInPicture = ref(true)

  return { lang, mode, pictureInPicture, edit }
})
