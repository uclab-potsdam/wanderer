import { computed, ref, watch } from 'vue'
import { defineStore /*, acceptHMRUpdate */ } from 'pinia'
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'

export const useSyncStore = defineStore('sync', () => {
  const terminusStore = useTerminusStore()
  const viewStore = useViewStore()
  const channel = new BroadcastChannel('sync')
  const time = ref(0)
  const framerate = ref(23.98)
  const timeOverwrite = ref(null)
  const playing = ref(false)
  const duration = ref(100)
  const mute = ref(false)
  const playsExternal = ref(false)
  const next = ref(false)

  const loop = ref(false)

  const sources = ref([])
  const subtitles = ref(null)

  watch(
    () => terminusStore.media,
    () => {
      sources.value = terminusStore.media?.file?.map((d) => viewStore.getMediaUrl(d)) || []
    }
  )

  watch(
    () => terminusStore.media,
    () => {
      const st = viewStore.localize(terminusStore.media?.subtitle ?? {})
      subtitles.value = st ? { lang: st.lang, value: viewStore.getMediaUrl(st.text) } : null
    }
  )
  // const doubleCount = computed(() => count.value * 2);
  function updateTime(t) {
    time.value = t
    channel.postMessage({
      action: 'update_time',
      value: time.value
    })
  }
  function setTime(t) {
    timeOverwrite.value = t
    channel.postMessage({
      action: 'set_time',
      value: t
    })
  }
  function setDuration(t) {
    duration.value = t
    channel.postMessage({
      action: 'set_duration',
      value: duration.value
    })
  }
  function setLoop(l) {
    loop.value = l
    channel.postMessage({
      action: 'set_loop',
      value: loop.value
    })
  }
  function setPlaying(p) {
    playing.value = p
    channel.postMessage({
      action: 'set_playing',
      value: playing.value
    })
  }
  function togglePlay() {
    playing.value = !playing.value
    channel.postMessage({
      action: 'set_playing',
      value: playing.value
    })
  }
  function setMute(m) {
    mute.value = m
    channel.postMessage({
      action: 'set_mute',
      value: mute.value
    })
  }
  function toggleMute() {
    mute.value = !mute.value
    channel.postMessage({
      action: 'set_mute',
      value: mute.value
    })
  }

  function requestDuration() {
    channel.postMessage({
      action: 'request_duration'
    })
  }

  function requestNext() {
    next.value = !next.value
    channel.postMessage({
      action: 'request_next'
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

  async function getSources() {
    sources.value = (await terminusStore.getMedia())?.sources
  }

  function handshake() {
    channel.postMessage({
      action: 'handshake'
    })
  }

  function releaseHandshake() {
    channel.postMessage({
      action: 'handshake-release'
    })
  }

  function playFromStart() {
    channel.postMessage({
      action: 'post_sources',
      value: JSON.stringify(sources.value)
    })

    updateTime(0)
  }

  const progress = computed(() => time.value / duration.value)

  channel.addEventListener('message', ({ data }) => {
    switch (data.action) {
      case 'update_time':
        time.value = data.value
        break
      case 'set_time':
        timeOverwrite.value = data.value
        break
      case 'set_playing':
        playing.value = data.value
        break
      case 'set_mute':
        mute.value = data.value
        break
      case 'set_duration':
        duration.value = data.value
        break
      case 'handshake':
        playsExternal.value = true
        channel.postMessage({
          action: 'post_sources',
          value: JSON.stringify(sources.value)
        })
        break
      case 'handshake-release':
        playsExternal.value = false
        break
      case 'post_sources':
        sources.value = JSON.parse(data.value)
        break
      case 'request_duration':
        channel.postMessage({
          action: 'set_duration',
          value: duration.value
        })
        break
      case 'request_next':
        next.value = !next.value
        break
      case 'set_loop':
        loop.value = data.value
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
    timeOverwrite,
    atMarker,
    currentMarker,
    framerate,
    sources,
    playsExternal,
    next,
    loop,
    subtitles,
    getSources,
    updateTime,
    setTime,
    setPlaying,
    setMute,
    setDuration,
    togglePlay,
    toggleMute,
    requestDuration,
    handshake,
    releaseHandshake,
    playFromStart,
    setLoop
  }
})

// if (import.meta.hot) {
//   import.meta.hot.accept(acceptHMRUpdate(useSyncStore, import.meta.hot))
// }
