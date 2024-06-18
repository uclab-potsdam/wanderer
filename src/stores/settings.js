import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const lang = useStorage('lang', 'en')
  const edit = useStorage('edit', false)
  const pictureInPicture = useStorage('pip', false)
  const server = useStorage('server', 'http://localhost:3000')
  const db = useStorage('db', null)

  const remote = useStorage('remote', false)

  return { lang, pictureInPicture, edit, server, remote, db }
})
