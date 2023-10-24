import { ref, watch, computed } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'

import { usePermanentStore } from '@/stores/permanent'
import { useTerminusStore } from '@/stores/terminus'

import { MODE_VIEW, MODE_COMPOSE, MODE_COUPLE } from '@/assets/js/constants'

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

  const modeClass = computed(() => {
    switch (mode.value) {
      case MODE_COMPOSE:
        return 'mode-compose'
      case MODE_COUPLE:
        return 'mode-couple'
      case MODE_VIEW:
        return 'mode-view'
    }
    return null
  })

  const stateLevelCount = ref(+import.meta.env.VITE_STATE_LEVEL_COUNT)
  const stateLevelDefault = ref(+import.meta.env.VITE_STATE_LEVEL_DEFAULT)

  const activityTrackingController = new AbortController()
  let activityTrackingTimeout = null
  const activity = ref(false)
  function startActivityTracking() {
    window.addEventListener(
      'mousemove',
      () => {
        activity.value = true
        clearTimeout(activityTrackingTimeout)
        activityTrackingTimeout = setTimeout(() => {
          activity.value = false
        }, 2500)
      },
      { signal: activityTrackingController.signal }
    )
  }

  function stopActivityTracking() {
    activityTrackingController.abort()
  }

  return {
    before,
    languageList,
    languageOptions,
    language,
    localize,
    getMediaUrl,
    mode,
    modeSetting,
    modeClass,
    stateLevelCount,
    stateLevelDefault,
    startActivityTracking,
    stopActivityTracking,
    activity
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useViewStore, import.meta.hot))
}
