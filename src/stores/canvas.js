import { ref } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { zoomIdentity } from 'd3-zoom'

export const useCanvasStore = defineStore('canvas', () => {
  const transform = ref(zoomIdentity)
  const nodes = ref({})

  function updateNode(id, rect) {
    nodes.value[id] = rect
    const margin = 5
    nodes.value[id].bounds = [
      { x: rect.x - (rect.width / 2 + margin), y: rect.y - (rect.height / 2 + margin) },
      { x: rect.x + (rect.width / 2 + margin), y: rect.y - (rect.height / 2 + margin) },
      { x: rect.x + (rect.width / 2 + margin), y: rect.y + (rect.height / 2 + margin) },
      { x: rect.x - (rect.width / 2 + margin), y: rect.y + (rect.height / 2 + margin) }
    ]
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
