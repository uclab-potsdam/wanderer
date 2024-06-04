import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useDataStore } from './data'

export const useConnectStore = defineStore('connect', () => {
  const dataStore = useDataStore()

  const connecting = ref(false)
  const offset = ref({ x: 100, y: 100 })
  const start = ref(null)
  const arrow = ref(null)
  const graph = ref(null)

  const controller = new AbortController()

  function open(id, a, g) {
    connecting.value = true
    arrow.value = a
    start.value = id
    graph.value = g
    // offset.value = position

    window.addEventListener(
      'keydown',
      (e) => {
        if (e.key !== 'Escape') return
        controller.abort()
        connecting.value = false
      },
      { signal: controller.signal }
    )

    // window.addEventListener(
    //   'click',
    //   () => {
    //     controller.abort()
    //     show.value = false
    //   },
    //   { once: true, signal: controller.signal }
    // )

    // window.addEventListener(
    //   'mousedown',
    //   () => {
    //     controller.abort()
    //     show.value = false
    //   },
    //   { once: true, signal: controller.signal }
    // )
  }

  function close(target) {
    controller.abort()
    connecting.value = false

    dataStore.data.edges.push({
      nodes: [start.value, target],
      arrow: arrow.value,
      graph: graph.value,
      id: crypto.randomUUID()
    })
  }

  return { connecting, offset, open, start, close }
})
