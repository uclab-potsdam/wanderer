import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed, watch } from 'vue'
import { useEditStore } from './edit'

export const useSettingsStore = defineStore('settings', () => {
  const editStore = useEditStore()

  const lang = useStorage('lang', 'en')
  const edit = useStorage('edit', false)
  const pictureInPicture = useStorage('pip', false)
  const server = useStorage('server', 'http://localhost:3000')
  const db = useStorage('db', null)

  const remote = useStorage('remote', false)

  watch(edit, () => editStore.resetMode())

  return { lang, pictureInPicture, edit, server, remote, db }
})
