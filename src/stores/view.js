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
  return { before, userLanguages, localize }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useViewStore, import.meta.hot))
}
