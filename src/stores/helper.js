import { defineStore } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { expand } from '@/assets/js/resolveUrl'

export const useHelperStore = defineStore('helper', () => {
  const settingsStore = useSettingsStore()

  function getMediaUrl(path) {
    return expand(path)
  }

  function localize(text) {
    return text?.[settingsStore.lang] || text?.universal || text?.en
  }

  return { getMediaUrl, localize }
})
