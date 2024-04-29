import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

export const useSettingsStore = defineStore('settings', () => {
  const lang = useStorage('lang', 'en')
  const mode = ref('CURATE')
  const edit = useStorage('edit', false)
  const pictureInPicture = ref(true)

  return { lang, mode, pictureInPicture, edit }
})
