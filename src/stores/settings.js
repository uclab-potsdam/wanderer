import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useSettingsStore = defineStore('settings', () => {
  const lang = useStorage('lang', 'en')
  const edit = useStorage('edit', false)
  const pictureInPicture = useStorage('pip', false)

  return { lang, pictureInPicture, edit }
})
