import { defineStore } from 'pinia'
import { useConstantStore } from '@/stores/constant'
import { useSettingsStore } from '@/stores/settings'

export const useHelperStore = defineStore('helper', () => {
  const constantStore = useConstantStore()
  const settingsStore = useSettingsStore()

  function getMediaUrl(path) {
    return `${constantStore.mediaServerUrl}/${path.replace(/^\//, '')}`
  }

  function localize(text) {
    return text?.[settingsStore.lang] ?? text?.universal ?? text?.en
  }

  return { getMediaUrl, localize }
})
