import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed, watch } from 'vue'
import { useEditStore } from './edit'

export const useSettingsStore = defineStore('settings', () => {
  const editStore = useEditStore()

  const lang = useStorage('lang', 'en')
  const videoLang = useStorage('video-lang', 'en')
  const edit = computed(() => mode.value === 'edit')
  const pictureInPicture = useStorage('pip', false)
  const pictureInPictureVideo = useStorage('pip-video', true)
  const server = useStorage('server', 'http://localhost:3000')
  const db = useStorage('db', null)

  const mode = useStorage('mode', 'public')
  const modeOptions = ['public', 'edit', 'preview']

  const enableEditing = useStorage('enableEditing', false)

  const exhibition = false

  watch(edit, (edit) => {
    if (!edit) editStore.exit()
  })

  watch(
    enableEditing,
    (enableEditing) => {
      if (!enableEditing) mode.value = 'public'
    },
    { immediate: true }
  )

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

  return {
    lang,
    videoLang,
    pictureInPicture,
    pictureInPictureVideo,
    edit,
    server,
    db,
    mode,
    modeOptions,
    exhibition,
    enableEditing
  }
})
