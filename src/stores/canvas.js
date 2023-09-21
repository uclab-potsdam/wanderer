import { ref } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { zoomIdentity } from 'd3-zoom'

export const useCanvasStore = defineStore('canvas', () => {
  const transform = ref(zoomIdentity)
  const nodes = ref({})

  function updateNode(id, n) {
    const node = { ...(nodes.value[id] || {}), ...n }

    const margin = 10
    node.bounds = [
      { x: node.x - (node.width / 2 + margin), y: node.y - (node.height / 2 + margin) },
      { x: node.x + (node.width / 2 + margin), y: node.y - (node.height / 2 + margin) },
      { x: node.x + (node.width / 2 + margin), y: node.y + (node.height / 2 + margin) },
      { x: node.x - (node.width / 2 + margin), y: node.y + (node.height / 2 + margin) }
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
    deleteNode
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCanvasStore, import.meta.hot))
}
