import { ref } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { zoomIdentity } from 'd3-zoom'

export const useCanvasStore = defineStore('canvas', () => {
  const transform = ref(zoomIdentity)
  const nodes = ref({})
  const bounds = ref(null)
  const offset = { x: 45, y: 32.5 }

  function updateNode(id, n) {
    const node = { ...(nodes.value[id] || {}), ...n }

    node.bounds = {
      top: node.y - offset.y,
      right: node.x + (node.width - offset.x),
      bottom: node.y + (node.height - offset.y),
      left: node.x - offset.x
    }
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
    bounds,
    offset
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCanvasStore, import.meta.hot))
}
