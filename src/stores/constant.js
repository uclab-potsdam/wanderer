import { defineStore } from 'pinia'

export const useConstantStore = defineStore('constant', () => {
  // CSS custom properties
  const transition = +getComputedStyle(document.documentElement)
    .getPropertyValue('--transition')
    .replace(/(.+)ms/, (_, ms) => ms)
    .replace(/(.+)s/, (_, s) => s * 1000)

  const spacing = +getComputedStyle(document.documentElement)
    .getPropertyValue('--spacing')
    .replace(/px$/, '')

  const mediaServerUrl = import.meta.env.VITE_MEDIA_SERVER.replace(/\/$/, '')
  const databaseUrl = import.meta.env.VITE_DATABASE_URL.replace(/\/$/, '')
  const languages = import.meta.env.VITE_LANGUAGES.split(',')

  return { transition, spacing, mediaServerUrl, databaseUrl, languages }
})
