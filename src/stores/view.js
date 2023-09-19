import { ref, watch, computed } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'

import { usePermanentStore } from '@/stores/permanent'
import { useTerminusStore } from '@/stores/terminus'

import { MODE_VIEW } from '@/assets/js/constants'

export const useViewStore = defineStore('view', () => {
  const before = ref(null)

  const permanentStore = usePermanentStore()
  const terminusStore = useTerminusStore()

  const languageOptions = ref(
    import.meta.env.VITE_LANGUAGE_OPTIONS.split(',').map((l) => ({
      value: l.split(':')[0],
      label: l.split(':')[1]
    }))
  )

  const language = ref(
    localStorage.getItem('LANGUAGE') ??
      languageOptions.value.find((option) => option.value === navigator.language.replace(/-.*/, ''))
        ?.value ??
      languageOptions.value[0].value
  )

  const languageList = ref([
    // ...new Set([language.value, ...import.meta.env.VITE_LANGUAGE_LIST.split(',')])
  ])

  watch(
    () => language.value,
    () => {
      languageList.value = [
        ...new Set([language.value, ...import.meta.env.VITE_LANGUAGE_LIST.split(',')])
      ]
      terminusStore.languageList = languageList.value
      localStorage.setItem('LANGUAGE', language.value)
    },
    { immediate: true }
  )

  function localize(text) {
    if (text == null) return null
    return languageList.value.map((lang) => ({ text: text[lang], lang })).find((d) => d.text)
  }

  function getMediaUrl(filename) {
    // return `${import.meta.env.VITE_MEDIA_SERVER.replace(/\/$/, '')}/${filename.replace(/^\//, '')}`
    return `${import.meta.env.VITE_MEDIA_SERVER}${filename.replace(/^\//, '')}`
  }

  const modeSetting = ref(permanentStore.getMode() ?? MODE_VIEW)
  const mode = computed(() => (terminusStore.isAuthor ? modeSetting.value : MODE_VIEW))
  watch(
    () => modeSetting.value,
    () => {
      permanentStore.setMode(modeSetting.value)
    }
  )

  async function getTitle(route) {
    if (route.meta.resolveTitle) {
      return localize(
        await terminusStore.getLabel(`${route.params.type ?? route.name}/${route.params.id}`)
      )
    }
  }

  const stateLevelCount = ref(+import.meta.env.VITE_STATE_LEVEL_COUNT)
  const stateLevelDefault = ref(+import.meta.env.VITE_STATE_LEVEL_DEFAULT)

  return {
    before,
    languageList,
    languageOptions,
    language,
    localize,
    getMediaUrl,
    mode,
    modeSetting,
    getTitle,
    stateLevelCount,
    stateLevelDefault
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useViewStore, import.meta.hot))
}
