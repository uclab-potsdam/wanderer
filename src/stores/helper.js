import { defineStore } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { expand } from '@/assets/js/resolveUrl'
import { useDataStore } from './data'

export const useHelperStore = defineStore('helper', () => {
  const settingsStore = useSettingsStore()
  const dataStore = useDataStore()

  function getMediaUrl(path) {
    return sessionStorage.getItem(path) ?? expand(path)
  }

  function getLocalizedMediaUrl(files) {
    const path =
      files?.[settingsStore.videoLang] ||
      files?.[dataStore.data.config.languages.video.find((l) => files?.[l.key])?.key]
    return expand(path)
  }

  function localize(text, strict) {
    if (strict || dataStore.data == null) return text?.[settingsStore.lang]
    return (
      text?.[settingsStore.lang] ||
      text?.[dataStore.data.config.languages.text.find((l) => text?.[l.key])?.key]
    )
  }
  return { getMediaUrl, getLocalizedMediaUrl, localize }
})
