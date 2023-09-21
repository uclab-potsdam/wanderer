import { computed, ref, watch } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useTerminusStore } from '@/stores/terminus'
import { useCanvasStore } from '@/stores/canvas'

export const useComposeStore = defineStore('compose', () => {
  const terminusStore = useTerminusStore()
  const canvasStore = useCanvasStore()

  const movingNode = ref(null)
  function moveNode(node, position, offset) {
    movingNode.value = node
    const controller = new AbortController()

    window.addEventListener(
      'mousemove',
      (e) => {
        terminusStore.updateAllocation(node, getPosition(e), true)
      },
      { signal: controller.signal }
    )

    window.addEventListener(
      'mouseup',
      (e) => {
        terminusStore.updateAllocation(node, getPosition(e))
        reset()
      },
      { once: true, signal: controller.signal }
    )

    window.addEventListener(
      'keydown',
      (e) => {
        if (e.key !== 'Escape') return
        terminusStore.updateAllocation(node, position, true)
        reset()
      },
      { once: true, signal: controller.signal }
    )

    function getPosition(e) {
      return {
        x: position.x + (e.x - offset.x) / canvasStore.transform.k,
        y: position.y + (e.y - offset.y) / canvasStore.transform.k
      }
    }

    function reset() {
      movingNode.value = null
      controller.abort()
    }
  }

  const sourceNode = ref(null)
  const targetNode = ref(null)
  const drawingEdge = ref(null)
  const arrow = ref({ x: 0, y: 0, r: 0 })
  function drawEdge(node, position, offset) {
    sourceNode.value = node
    const controller = new AbortController()
    // const delta = {
    //   x: position.x - (offset.x / canvasStore.transform.k - canvasStore.transform.x)
    // }

    window.addEventListener(
      'mousemove',
      (e) => {
        arrow.value.x = (e.x - canvasStore.transform.x) / canvasStore.transform.k
        arrow.value.y = (e.y - canvasStore.transform.y) / canvasStore.transform.k
        arrow.value.r = getArrowRotation(e)
        drawingEdge.value = `M${position.x} ${position.y} L${arrow.value.x} ${arrow.value.y}`
      },
      { signal: controller.signal }
    )

    window.addEventListener(
      'mouseup',
      () => {
        if (sourceNode.value && targetNode.value && sourceNode.value !== targetNode.value) {
          terminusStore.addEdge(sourceNode.value, targetNode.value)
        }
        reset()
      },
      { once: true }
    )

    window.addEventListener(
      'keydown',
      (e) => {
        if (e.key !== 'Escape') return
        terminusStore.updateAllocation(node, position, true)
        reset()
      },
      { once: true, signal: controller.signal }
    )

    function getArrowRotation(e) {
      const vectorX =
        e.x / canvasStore.transform.k -
        (position.x + canvasStore.transform.x / canvasStore.transform.k)
      const vectorY =
        e.y / canvasStore.transform.k -
        (position.y + canvasStore.transform.y / canvasStore.transform.k)
      return Math.atan(vectorY / vectorX) * (180 / Math.PI) + (vectorX > 0 ? 0 : 180)
    }

    function reset() {
      arrow.value.x = 0
      arrow.value.y = 0
      sourceNode.value = null
      targetNode.value = null
      drawingEdge.value = null
      controller.abort()
    }
  }

  return {
    movingNode,
    moveNode,
    sourceNode,
    targetNode,
    arrow,
    drawingEdge,
    drawEdge
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useComposeStore, import.meta.hot))
}
