import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useConfigStore } from './config'
import { useSettingsStore } from './settings'
import { applyPatch, compare } from 'fast-json-patch'

import cloneDeep from 'lodash.clonedeep'

export const useDataStore = defineStore('data', () => {
  const configStore = useConfigStore()
  const settingsStore = useSettingsStore()
  const data = ref({ nodes: [] })
  const nodeId = ref(null)

  async function init() {
    data.value = { nodes: {}, edges: [] }
    if (settingsStore.mode === 'live' || localStorage.getItem(`wanderer:data`) == null) {
      data.value = await fetch(configStore.wandererStatic).then((d) => d.json())
    } else {
      data.value = JSON.parse(localStorage.getItem(`wanderer:data`))
    }
  }

  const nodeOccurances = computed(() => {
    if (node.value == null || node.value.type === 'graph') return {}
    return Object.fromEntries(
      Object.entries(data.value.nodes).filter(
        (d) =>
          d[1].type === 'graph' &&
          Object.prototype.hasOwnProperty.call(d[1].allocations ?? {}, nodeId.value)
      )
    )
  })

  const node = computed(() => data.value?.nodes[nodeId.value])

  const nodes = computed(() => {
    return Object.entries(data.value.nodes).map((d) => ({ id: d[0], ...d[1] }))
  })

  const graphs = computed(() => {
    if (data.value == null) return
    return Object.entries(data.value.nodes)
      .filter((d) => d[1].type === 'graph')
      .map((d) => ({
        id: d[0],
        ...d[1]
      }))
  })

  watch(
    () => settingsStore.mode,
    () => init(),
    { immediate: true }
  )

  function storeData(data) {
    localStorage.setItem('wanderer:data', JSON.stringify(data))
  }

  function deleteLocalChanges() {
    localStorage.removeItem('wanderer:data')
  }

  function exportProject() {
    const project = JSON.stringify(JSON.parse(localStorage.getItem(`wanderer:data`)), null, 2)
    const blob = new Blob([project], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = `db.json`
    link.href = window.URL.createObjectURL(blob)
    link.dataset.downloadurl = ['text/json', link.download, link.href].join(':')
    const evt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    })
    link.dispatchEvent(evt)
    link.remove()
  }

  const dataCopy = computed(() => {
    return cloneDeep(data.value)
  })

  watch(
    dataCopy,
    (value) => {
      if (settingsStore.edit) storeData(value)

      // compare(oldValue, value))
    },
    { deep: true }
  )

  function deleteNode(id, graph, force = false) {
    const occurances = graphs.value.filter((g) => g.allocations?.[id] != null).map(({ id }) => id)
    const deleteFrom = force ? occurances : [graph]

    deleteFrom.forEach((graph) => {
      delete data.value.nodes[graph].allocations[id]
      data.value.edges = data.value.edges.filter(
        (edge) => edge.graph !== graph || !edge.nodes.includes(id)
      )
    })

    if ((occurances.length === 1 && data.value.nodes[id].type != 'graph') || force) {
      delete data.value.nodes[id]
    }
  }

  function createNode(node) {
    const id = crypto.randomUUID()
    data.value.nodes[id] = node
    return id
  }

  return {
    init,
    data,
    dataCopy,
    node,
    nodes,
    graphs,
    nodeId,
    nodeOccurances,
    open,
    storeData,
    deleteNode,
    createNode,
    exportProject,
    deleteLocalChanges
  }
})
