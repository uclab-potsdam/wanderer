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

  function exit() {
    resetMode()
  }

  function setDisplay(id, display, graphId) {
    const graph = dataStore.data.nodes[graphId]
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

  function setBounds(bounds, graphId, t) {
    const graph = dataStore.data.nodes[graphId]
    const time = t ?? videoStore.time
    let marker = graph.marker?.find((m) => m.time === time)

    if (bounds == null) {
      if (marker == null) return
      delete marker.bounds
      cleanUpMarker(marker, graph)
      return
    }

    if (marker == null) {
      marker = { time }
      graph.marker = [...graph.marker, marker]
    }

    const { x1, y1, x2, y2 } = bounds

    marker.bounds = {
      x1: Math.min(x1, x2),
      y1: Math.min(y1, y2),
      x2: Math.max(x1, x2),
      y2: Math.max(y1, y2)
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

  return { mode, resetMode, exit, setDisplay, setBounds }
})
