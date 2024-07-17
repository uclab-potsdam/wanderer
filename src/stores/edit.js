import { ref, watchEffect } from 'vue'
import { defineStore } from 'pinia'
import { useDataStore } from './data'
import { useVideoStore } from './video'

export const useEditStore = defineStore('edit', () => {
  const dataStore = useDataStore()
  const videoStore = useVideoStore()
  const mode = ref('default')

  function resetMode() {
    mode.value = 'default'
  }

  function setDisplay(id, display, graph_id) {
    const graph = dataStore.data.nodes[graph_id]
    const time = videoStore.time
    let marker = graph.marker?.find((m) => m.time === time)

    if (display === null) {
      if (marker?.states?.[id] !== null) {
        delete marker.states[id]
        cleanUpMarker(marker, graph)
      }
    } else {
      if (marker == null) {
        marker = { time }
        graph.marker = [...graph.marker, marker]
      }
      marker.states = { ...marker.states, [id]: display }
    }
  }

  function cleanUpMarker(marker, graph) {
    if (marker.states && Object.keys(marker.states).length === 0) {
      delete marker.states
    }
    if (marker.states == null && marker.bounds == null) {
      graph.marker = graph.marker.filter((m) => m.time !== marker.time)
    }
  }

  return { mode, resetMode, setDisplay }
})
