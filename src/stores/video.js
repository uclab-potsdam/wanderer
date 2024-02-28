import { defineStore } from 'pinia'
import { computed, ref, watch, watchEffect } from 'vue'
import { parseSRT } from '@/assets/js/subtitles'

import { useDataStore } from '@/stores/data'
import { useHelperStore } from '@/stores/helper'

import { useRouter } from 'vue-router'

export const useVideoStore = defineStore('video', () => {
  const dataStore = useDataStore()
  const helperStore = useHelperStore()
  const router = useRouter()

  const channel = new BroadcastChannel('video')

  const history = ref([])
  const graphId = ref(null)
  const time = ref(0)
  const playFrom = ref(null)
  const subtitles = ref(null)
  const hasExternalPlayer = ref(false)
  const isExternalPlayer = ref(false)
  const next = ref(null)

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
    if (isExternalPlayer.value) return
    history.value.push(id)
    if (history.value.length > 3) history.value.splice(0, 1)
    next.value = getNextGraph()

    if (hasExternalPlayer.value) setGraph()
  })

  watch(time, (time) => {
    if (!isExternalPlayer.value) return
    channel.postMessage({ action: 'set_time', time })
  })

  function getNextGraph() {
    let relatedGraphs = Object.keys(dataStore.data?.nodes[graphId.value].allocations).filter(
      (id) => dataStore.data.nodes[id].type === 'graph'
    )

    if (relatedGraphs.length === 0) {
      relatedGraphs = Object.keys(dataStore.data?.nodes).filter(
        (id) => dataStore.data.nodes[id].type === 'graph'
      )
    }

    history.value.toReversed().forEach((id) => {
      if (relatedGraphs.length <= 0) return
      relatedGraphs = relatedGraphs.filter((r) => r !== id)
    })

    const index = Math.floor(Math.random() * relatedGraphs.length)
    return relatedGraphs[index]
  }

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

  function requestNext() {
    channel.postMessage({ action: 'request_next' })
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
      case 'request_next':
        router.push({ name: 'graph', params: { type: 'graph', id: next.value } })
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
    detachPlayer,
    requestNext,
    isExternalPlayer,
    next
  }
})
