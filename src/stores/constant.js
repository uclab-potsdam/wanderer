import { defineStore } from 'pinia'

export const useConstantStore = defineStore('constant', () => {
  // CSS custom properties
  const transition = +getComputedStyle(document.documentElement)
    .getPropertyValue('--transition')
    .replace(/(.+)ms/, (_, ms) => ms)
    .replace(/(.+)s/, (_, s) => s * 1000)

  const mediaServerUrl = import.meta.env.VITE_MEDIA_SERVER.replace(/\/$/, '')

  return { transition, mediaServerUrl }
})
