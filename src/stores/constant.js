import { defineStore } from 'pinia'

export const useConstantStore = defineStore('constant', () => {
  // CSS custom properties
  const transition = +getComputedStyle(document.documentElement)
    .getPropertyValue('--transition')
    .replace(/(.+)ms/, (_, ms) => ms)
    .replace(/(.+)s/, (_, s) => s * 1000)

  return { transition }
})
