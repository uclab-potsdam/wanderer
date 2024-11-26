import { defineStore } from 'pinia'
import wanderer from '../../wanderer'

export const useConfigStore = defineStore('config', () => {
  const wandererStatic = import.meta.env.VITE_WANDERER_STATIC.replace(/\/$/, '')

  return { ...wanderer, wandererStatic }
})
