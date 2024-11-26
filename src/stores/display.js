import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useVideoStore } from '@/stores/video'
import { useDataStore } from '@/stores/data'
import { useSettingsStore } from './settings'

export const useDisplayStore = defineStore('display', () => {
  const videoStore = useVideoStore()
  const dataStore = useDataStore()
  const settingsStore = useSettingsStore()

  const markers = computed(() => {
    if (settingsStore.markersDisabled) return []
    if (dataStore.node?.marker == null) return []
    return dataStore.node?.marker
      .filter((marker) => marker.time <= videoStore.time)
      .sort((a, b) => a.time - b.time)
  })

  const exactMarker = computed(() => {
    if (settingsStore.markersDisabled) return
    return dataStore.node?.marker?.find((marker) => marker.time === videoStore.time)
  })

  const states = computed(() => {
    return markers.value.reduce((a, b) => ({ ...a, ...b.states }), { states: {} })
  })

  const bounds = computed(() => markers.value.findLast((m) => m.bounds != null)?.bounds)

  function getLowestState(states) {
    if (settingsStore.markersDisabled) return 'default'
    if (states.includes('hide')) return 'hide'
    if (states.every((state) => state === 'highlight')) return 'highlight'
    return 'default'
  }

  function inheritStateFromNodes(nodes) {
    if (settingsStore.markersDisabled) return 'default'
    const nodeStates = nodes.map((id) => {
      if (dataStore.data.nodes[id].inheritDisplay) return inheritStateFromNeighbor(id)
      return states.value[id]
    })
    return getLowestState(nodeStates)
  }

  function inheritStateFromNeighbor(id) {
    if (settingsStore.markersDisabled) return 'default'
    const neighborStates = dataStore.data.edges
      .filter((edge) => edge.nodes.includes(id))
      .map((edge) => {
        const neighbor = edge.nodes.find((n) => n !== id)
        return states.value[neighbor]
      })
    return getLowestState(neighborStates)
  }

  return { markers, exactMarker, states, bounds, inheritStateFromNodes, inheritStateFromNeighbor }
})
