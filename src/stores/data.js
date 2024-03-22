import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useConstantStore } from './constant'

export const useDataStore = defineStore('data', () => {
  const constantStore = useConstantStore()
  const data = ref(null)
  const nodeId = ref(null)

  async function init() {
    data.value = await fetch(constantStore.databaseUrl).then((d) => d.json())
  }

  const nodeOccurances = computed(() => {
    if (node.value == null || node.value.type === 'graph') return
    return Object.fromEntries(
      Object.entries(data.value.nodes).filter(
        (d) =>
          d[1].type === 'graph' &&
          Object.prototype.hasOwnProperty.call(d[1].allocations ?? {}, nodeId.value)
      )
    )
  })

  const node = computed(() => data.value.nodes[nodeId.value])

  const graphs = computed(() =>
    Object.entries(data.value.nodes)
      .filter((d) => d[1].type === 'graph')
      .map((d) => ({
        id: d[0],
        ...d[1]
      }))
  )

  return { init, data, node, graphs, nodeId, nodeOccurances }
})
