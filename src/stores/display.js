import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useVideoStore } from '@/stores/video'
import { useDataStore } from '@/stores/data'

export const useDisplayStore = defineStore('display', () => {
  const videoStore = useVideoStore()
  const dataStore = useDataStore()

  const markers = computed(() => {
    if (dataStore.node?.marker == null) return []
    return dataStore.node?.marker
      .filter((marker) => marker.time <= videoStore.time)
      .sort((a, b) => a.time - b.time)
  })

  const states = computed(() => {
    return markers.value.reduce((a, b) => ({ ...a, ...b.states }), { states: {} })
  })

  function getLowestState(states) {
    if (states.includes('hide')) return 'hide'
    if (states.every((state) => state === 'highlight')) return 'highlight'
    return 'default'
  }

  function inheritStateFromNodes(nodes) {
    const nodeStates = nodes.map((id) => {
      if (dataStore.data.nodes[id].inheritDisplay) return inheritStateFromNeighbor(id)
      return states.value[id]
    })
    return getLowestState(nodeStates)
  }

  function inheritStateFromNeighbor(id) {
    const neighborStates = dataStore.data.edges
      .filter((edge) => edge.nodes.includes(id))
      .map((edge) => {
        const neighbor = edge.nodes.find((n) => n !== id)
        return states.value[neighbor]
      })
    return getLowestState(neighborStates)
  }

  return { states, markers, inheritStateFromNodes, inheritStateFromNeighbor }
})
