import { ref, watch, computed } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'

import { usePermanentStore } from '@/stores/permanent'
import { useTerminusStore } from '@/stores/terminus'

import {
  MODE_VIEW,
  MODE_COMPOSE,
  MODE_COUPLE,
  INACTIVITY_SHORT,
  INACTIVITY_MID,
  INACTIVITY_LONG
} from '@/assets/js/constants'

export const useViewStore = defineStore('view', () => {
  const before = ref(null)

  const permanentStore = usePermanentStore()
  const terminusStore = useTerminusStore()

  const keyPressedShift = ref(false)

  const languageOptions = ref(
    import.meta.env.VITE_LANGUAGE_OPTIONS.split(',').map((l) => ({
      value: l.split(':')[0],
      label: l.split(':')[1]
    }))
  )

  const language = ref(
    localStorage.getItem('LANGUAGE') ??
      languageOptions.value.find((option) => option.value === navigator.language.replace(/-.*/, ''))?.value ??
      languageOptions.value[0].value
  )

  const languageList = ref([
    // ...new Set([language.value, ...import.meta.env.VITE_LANGUAGE_LIST.split(',')])
  ])

  watch(
    () => language.value,
    () => {
      languageList.value = [...new Set([language.value, ...import.meta.env.VITE_LANGUAGE_LIST.split(',')])]
      terminusStore.languageList = languageList.value
      localStorage.setItem('LANGUAGE', language.value)
    },
    { immediate: true }
  )

  const theme = ref(permanentStore.getTheme() || 'Auto')
  watch(
    () => theme.value,
    () => {
      if (theme.value === 'Auto') {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.remove('light')
      } else if (theme.value === 'Light') {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      } else {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      }
      permanentStore.setTheme(theme.value)
    }
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
  let lastActivity = document.timeline.currentTime
  const inactivity = ref(0)
  let tracking = false
  const inactivityShort = ref(false)
  const inactivityMid = ref(false)
  const inactivityLong = ref(false)

  function updateActivity(t) {
    inactivity.value = t - lastActivity
    if (
      (inactivity.value < INACTIVITY_SHORT && inactivityShort.value) ||
      (inactivity.value > INACTIVITY_SHORT && !inactivityShort.value)
    ) {
      inactivityShort.value = !inactivityShort.value
    }

    if (
      (inactivity.value < INACTIVITY_LONG && inactivityLong.value) ||
      (inactivity.value > INACTIVITY_LONG && !inactivityLong.value)
    ) {
      inactivityLong.value = !inactivityLong.value
    }

    if (
      (inactivity.value < INACTIVITY_MID && inactivityMid.value) ||
      (inactivity.value > INACTIVITY_MID && !inactivityMid.value)
    ) {
      inactivityMid.value = !inactivityMid.value
    }
    if (tracking) {
      requestAnimationFrame(updateActivity)
    }
  }

  function registerActivity() {
    lastActivity = document.timeline.currentTime
  }

  function startActivityTracking() {
    tracking = true
    requestAnimationFrame(updateActivity)

    const options = { signal: activityTrackingController.signal }
    window.addEventListener('wheel', registerActivity, options)
    window.addEventListener('mousemove', registerActivity, options)
    window.addEventListener('touchstart', registerActivity, options)
    window.addEventListener('touchend', registerActivity, options)

    window.addEventListener(
      'keydown',
      ({ key }) => {
        if (key === 'Shift') keyPressedShift.value = true
      },
      options
    )
    window.addEventListener(
      'keyup',
      ({ key }) => {
        if (key === 'Shift') keyPressedShift.value = false
      },
      options
    )
  }

  function stopActivityTracking() {
    activityTrackingController.abort()
    tracking = true
  }

  return {
    before,
    languageList,
    languageOptions,
    language,
    theme,
    localize,
    getMediaUrl,
    mode,
    modeSetting,
    modeClass,
    stateLevelCount,
    stateLevelDefault,
    startActivityTracking,
    stopActivityTracking,
    inactivity,
    inactivityShort,
    inactivityMid,
    inactivityLong,
    registerActivity,
    keyPressedShift
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useViewStore, import.meta.hot))
}
