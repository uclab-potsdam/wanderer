import { defineStore } from 'pinia'
import wanderer from '../../wanderer'

export const useConfigStore = defineStore('config', () => {
  const mediaServerUrl = import.meta.env.VITE_MEDIA_SERVER.replace(/\/$/, '')
  const wandererStatic = import.meta.env.VITE_WANDERER_STATIC.replace(/\/$/, '')
  const wandererServer = import.meta.env.VITE_WANDERER_SERVER.replace(/\/$/, '')
  const languages = import.meta.env.VITE_LANGUAGES.split(',')

  return { ...wanderer, mediaServerUrl, wandererStatic, wandererServer, languages }
})
