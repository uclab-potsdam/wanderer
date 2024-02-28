import { defineStore } from 'pinia'
import { computed, ref, watch, watchEffect } from 'vue'
import { parseSRT } from '@/assets/js/subtitles'

import { useDataStore } from '@/stores/data'
import { useHelperStore } from './helper'

export const useVideoStore = defineStore('video', () => {
  const dataStore = useDataStore()
  const helperStore = useHelperStore()

  const history = ref([])
  const graphId = ref(null)
  const time = ref(0)
  const subtitles = ref(null)

  const video = computed(() => dataStore.data?.nodes[graphId.value]?.media)
  const playSplitScreen = computed(() => video.value != null)
  const subtitle = computed(
    () =>
      subtitles.value?.find((subtitle) => subtitle.start <= time.value && subtitle.end > time.value)
        ?.text
  )

  watchEffect(async () => {
    const file = helperStore.localize(video.value?.subtitles)
    if (file == null) return
    const url = helperStore.getMediaUrl(file)

    const text = await fetch(url).then((d) => d.text())

    subtitles.value = parseSRT(text)
  })

  // const subtitles = computed(() => {
  //   if (video.subtitles)
  // })

  watch(graphId, (id) => {
    history.value.push(id)
    if (history.value.length > 3) history.value.splice(0, 1)
  })

  return { history, graphId, video, playSplitScreen, time, subtitles, subtitle }
})
