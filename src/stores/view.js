import { ref, watch } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'

export const useViewStore = defineStore('view', () => {
  const before = ref(null)
  const userLanguages = ref(
    (localStorage.getItem('LANGUAGES') || import.meta.env.VITE_LANGUAGES).split(',')
  )

  watch(
    () => userLanguages.value,
    () => localStorage.setItem('LANGUAGES', userLanguages.value.join(','))
  )

  function localize(text) {
    if (text == null) return null
    return userLanguages.value.map((lang) => ({ text: text[lang], lang })).find((d) => d.text)
  }

  function getMediaUrl(filename) {
    return `${import.meta.env.VITE_MEDIA_SERVER.replace(/\/$/, '')}/${filename.replace(/^\//, '')}`
  }

  return { before, userLanguages, localize, getMediaUrl }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useViewStore, import.meta.hot))
}
