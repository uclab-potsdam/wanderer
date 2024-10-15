import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed, watch } from 'vue'
import { useEditStore } from './edit'

export const useSettingsStore = defineStore('settings', () => {
  const editStore = useEditStore()

  const lang = useStorage('lang', 'en')
  const edit = computed(() => mode.value === 'edit')
  const pictureInPicture = useStorage('pip', false)
  const server = useStorage('server', 'http://localhost:3000')
  const db = useStorage('db', null)

  const mode = useStorage('mode', 'live')
  const modeOptions = ['live', 'edit', 'preview']

  watch(edit, (edit) => {
    if (!edit) editStore.exit()
  })

  watch(
    mode,
    (mode) => {
      document.querySelector(':root').style.setProperty('--color-accent', `var(--color-${mode})`)
      if (mode === 'edit') {
        document.querySelector(':root').style.setProperty('--transition', `0s`)
      } else {
        document.querySelector(':root').style.removeProperty('--transition')
      }
    },
    { immediate: true }
  )

  return { lang, pictureInPicture, edit, server, db, mode, modeOptions }
})
