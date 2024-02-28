import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useDataStore = defineStore('data', () => {
  const data = ref(null)
  const nodeId = ref(null)

  async function init() {
    data.value = await fetch('/db.json').then((d) => d.json())
  }

  const nodeOccurances = computed(() => {
    if (node.value == null || node.value.type === 'graph') return
    return Object.fromEntries(
      Object.entries(data.value.nodes).filter(
        (d) =>
          d[1].type === 'graph' &&
          Object.prototype.hasOwnProperty.call(d[1].allocations, nodeId.value)
      )
    )
  })

  const node = computed(() => data.value.nodes[nodeId.value])

  return { init, data, node, nodeId, nodeOccurances }
})
