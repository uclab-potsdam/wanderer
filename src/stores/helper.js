import { defineStore } from 'pinia'
import { useConstantStore } from '@/stores/constant'

export const useHelperStore = defineStore('helper', () => {
  const constantStore = useConstantStore()

  function getMediaUrl(path) {
    return `${constantStore.mediaServerUrl}/${path.replace(/^\//, '')}`
  }

  return { getMediaUrl }
})
