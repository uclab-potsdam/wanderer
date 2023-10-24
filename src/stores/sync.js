import { computed, ref, watch } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'
import { idgen } from '@/assets/js/utils'

export const useSyncStore = defineStore('sync', () => {
  const terminusStore = useTerminusStore()
  const viewStore = useViewStore()
  const channel = new BroadcastChannel('sync')
  const time = ref(0)
  const framerate = ref(23.98)
  const forcedTime = ref(null)
  const playing = ref(false)
  const duration = ref(100)
  const mute = ref(false)
  const next = ref(false)

  const loop = ref(false)

  const sources = ref([])
  const subtitles = ref(null)

  let id = null
  const isPlayer = ref(false)
  const isCanvas = ref(false)
  const hasPlayer = ref(false)
  const hasCanvas = ref(false)

  watch(
    () => terminusStore.media,
    () => {
      sources.value = terminusStore.media?.file?.map((d) => viewStore.getMediaUrl(d)) || []
      const st = viewStore.localize(terminusStore.media?.subtitle ?? {})
      subtitles.value = st ? { lang: st.lang, value: viewStore.getMediaUrl(st.text) } : null
      loop.value = terminusStore.graphDoc.next == null
      updateMedia()
    }
  )

  function updateTime(t) {
    time.value = t
    channel.postMessage({
      action: 'update_time',
      value: time.value,
      id
    })
  }
  function forceTime(t) {
    forcedTime.value = t
    channel.postMessage({
      action: 'force_time',
      value: t,
      id
    })
  }
  function setDuration(t) {
    duration.value = t
    channel.postMessage({
      action: 'set_duration',
      value: duration.value,
      id
    })
  }
  function togglePlay() {
    playing.value = !playing.value
    channel.postMessage({
      action: 'set_playing',
      value: playing.value
    })
  }

  function requestNext() {
    next.value = !next.value
    channel.postMessage({
      action: 'request_next',
      id
    })
  }

  const atMarker = computed(() =>
    terminusStore.markers.find((marker) => {
      return Math.abs(time.value - marker.timestamp) <= 1 / framerate.value / 2
    })
  )

  const currentMarker = computed(() =>
    terminusStore.markers.reduce((a, b) => {
      if (b.timestamp - 1 / framerate.value / 2 > time.value) return a
      if (a == null) return b
      if (Math.abs(a.timestamp - time.value) < Math.abs(b.timestamp - time.value)) return a
      return b
    }, null)
  )

  function openCanvas() {
    isCanvas.value = true
    id = id ?? idgen()
    channel.postMessage({
      action: 'open_canvas',
      id,
      time: time.value || 0
    })
    updateMedia()
  }

  function closeCanvas() {
    isCanvas.value = false
    channel.postMessage({
      action: 'close_canvas',
      id
    })
  }

  function openPlayer() {
    id = id ?? idgen()
    isPlayer.value = true
    channel.postMessage({
      action: 'open_player',
      id
    })
  }

  function closePlayer() {
    isPlayer.value = false
    channel.postMessage({
      action: 'close_player',
      id,
      time: time.value || 0
    })
  }

  function updateMedia() {
    channel.postMessage({
      action: 'update_media',
      value: JSON.stringify({
        sources: sources.value,
        subtitles: subtitles.value,
        loop: loop.value
      }),
      id
    })
  }

  const progress = computed(() => time.value / duration.value)

  channel.addEventListener('message', ({ data }) => {
    if (id !== data.id && data.action !== 'open_player' && data.action !== 'open_canvas') return
    switch (data.action) {
      case 'open_canvas':
        if (isCanvas.value || hasCanvas.value) break
        hasCanvas.value = true
        id = data.id
        forcedTime.value = data.time
        openPlayer()
        break
      case 'open_player':
        if (isPlayer.value || hasPlayer.value) break
        hasPlayer.value = true
        id = data.id
        openCanvas()
        break
      case 'close_canvas':
        hasCanvas.value = false
        id = null
        break
      case 'close_player':
        hasPlayer.value = false
        forcedTime.value = data.time
        id = null
        break
      case 'update_media': {
        const value = JSON.parse(data.value)
        sources.value = value.sources
        subtitles.value = value.subtitles
        loop.value = value.loop
        break
      }
      case 'force_time':
        forcedTime.value = data.value
        break
      case 'update_time':
        time.value = data.value
        break
      case 'set_playing':
        playing.value = data.value
        break
      case 'set_duration':
        duration.value = data.value
        break
      case 'request_next':
        next.value = !next.value
        break
    }
  })

  return {
    requestNext,
    channel,
    time,
    playing,
    mute,
    duration,
    progress,
    forcedTime,
    atMarker,
    currentMarker,
    framerate,
    sources,
    next,
    loop,
    subtitles,
    updateTime,
    forceTime,
    setDuration,
    togglePlay,
    openCanvas,
    closeCanvas,
    openPlayer,
    closePlayer,
    hasCanvas,
    hasPlayer
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSyncStore, import.meta.hot))
}
