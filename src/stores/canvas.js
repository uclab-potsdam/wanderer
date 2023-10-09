import { ref } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { zoomIdentity } from 'd3-zoom'

export const useCanvasStore = defineStore('canvas', () => {
  const transform = ref(zoomIdentity)
  const nodes = ref({})
  const bounds = ref(null)

  function updateNode(id, n) {
    const node = { ...(nodes.value[id] || {}), ...n }

    const margin = 10
    const offset = 45
    node.bounds = [
      { x: node.x - (margin + offset), y: node.y - (margin + offset) },
      { x: node.x + (node.width + margin - offset), y: node.y - (margin + offset) },
      { x: node.x + (node.width + margin - offset), y: node.y + (node.height + margin - offset) },
      { x: node.x - (margin + offset), y: node.y + (node.height + margin - offset) }
    ]
    nodes.value[id] = node
  }

  function deleteNode(id) {
    delete nodes.value[id]
  }

  return {
    transform,
    nodes,
    updateNode,
    deleteNode,
    bounds
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCanvasStore, import.meta.hot))
}
