import { defineStore } from 'pinia'
import { computed, ref, watch, watchEffect } from 'vue'
import { parseSRT } from '@/assets/js/subtitles'

import { useDataStore } from '@/stores/data'
import { useHelperStore } from './helper'

export const useVideoStore = defineStore('video', () => {
  const dataStore = useDataStore()
  const helperStore = useHelperStore()

  const channel = new BroadcastChannel('video')

  const history = ref([])
  const graphId = ref(null)
  const time = ref(0)
  const playFrom = ref(null)
  const subtitles = ref(null)
  const hasExternalPlayer = ref(false)
  const isExternalPlayer = ref(false)

  const video = computed(() => dataStore.data?.nodes[graphId.value]?.media)
  const playSplitScreen = computed(() => video.value != null && !hasExternalPlayer.value)
  const subtitle = computed(
    () => subtitles.value?.find((st) => st.start <= time.value && st.end > time.value)?.text
  )

  watchEffect(async () => {
    const file = helperStore.localize(video.value?.subtitles)
    if (file == null) return
    const url = helperStore.getMediaUrl(file)

    const text = await fetch(url).then((d) => d.text())

    subtitles.value = parseSRT(text)
  })

  watch(graphId, (id) => {
    history.value.push(id)
    if (history.value.length > 3) history.value.splice(0, 1)
    if (hasExternalPlayer.value) setGraph()
  })

  watch(time, (time) => {
    if (!isExternalPlayer.value) return
    channel.postMessage({ action: 'set_time', time })
  })

  function attachPlayer() {
    isExternalPlayer.value = true
    channel.postMessage({ action: 'attach_player' })
    setTimeout(() => {
      if (graphId.value == null) attachPlayer()
    }, 500)
  }

  function detachPlayer() {
    isExternalPlayer.value = false
    channel.postMessage({ action: 'detach_player', time: time.value })
  }

  function setGraph(time = 0) {
    channel.postMessage({ action: 'set_graph', graphId: graphId.value, time })
  }

  channel.addEventListener('message', ({ data }) => {
    switch (data.action) {
      case 'attach_player':
        if (hasExternalPlayer.value) break
        hasExternalPlayer.value = true
        setGraph(time.value)
        break
      case 'detach_player':
        hasExternalPlayer.value = false
        playFrom.value = data.time
        break
      case 'reattach_player':
        attachPlayer()
        break
      case 'set_graph':
        graphId.value = data.graphId
        playFrom.value = data.time
        break
      case 'set_time':
        time.value = data.time
        if (!hasExternalPlayer.value) channel.postMessage({ action: 'reattach_player' })
        break
    }
  })

  return {
    history,
    graphId,
    video,
    playSplitScreen,
    time,
    playFrom,
    subtitles,
    subtitle,
    attachPlayer,
    detachPlayer
  }
})
