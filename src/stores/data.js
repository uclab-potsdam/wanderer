import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { useStorage } from '@vueuse/core'
import { useConstantStore } from './constant'
import { useSettingsStore } from './settings'
import { applyPatch, compare } from 'fast-json-patch'

import cloneDeep from 'lodash.clonedeep'

export const useDataStore = defineStore('data', () => {
  const constantStore = useConstantStore()
  const settingsStore = useSettingsStore()
  const data = ref({ nodes: [] })
  const nodeId = ref(null)

  let socket = null
  let skipUpdate = false

  const projectList = useStorage('wanderer-projects', [])
  const projectId = useStorage('project', null)

  // const socket = computed(() => {
  //   console.log('aaa')
  //   if (!settingsStore.remote) return
  //   const socket = io(settingsStore.server)
  //   return socket
  // })

  async function init() {
    data.value = { nodes: {}, edges: [] }
    if (project.value == null) {
      console.log(constantStore.wandererStatic)
      data.value = await fetch(constantStore.wandererStatic).then((d) => d.json())
    } else if (!project.value.remote) {
      data.value = JSON.parse(localStorage.getItem(`wanderer-${project.value.id}`))
    } else {
      skipUpdate = true
      initSocket()
      socket.emit('fetch', projectId.value)
    }
  }

  function initSocket() {
    socket = io(constantStore.wandererServer, { path: '/api/socket.io' })
    socket.on('data', (d) => {
      skipUpdate = true
      data.value = d
    })
    socket.on('update', (patch) => {
      skipUpdate = true
      applyPatch(data.value, patch)
    })
    socket.on('disconnect', () => {
      console.log('connection closed')
    })
    socket.on('created', (id) => {
      open(id)
    })
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

  const projects = computed(() => {
    return projectList.value
      .toSorted((a, b) => (a.opened < b.opened ? 1 : -1))
      .map((p) => ({
        ...p,
        opened: new Date(p.opened)
      }))
  })

  const project = computed(() => {
    return projectList.value.find((p) => p.id === projectId.value)
  })

  watch(projectId, () => init(), { immediate: true })

  async function importFromStatic() {
    const data = await fetch(constantStore.wandererStatic).then((d) => d.json())
    addProject(null, data)
  }

  function open(id) {
    const available = projectList.value.find((p) => p.id === id)
    if (available) {
      available.opened = new Date()
      projectId.value = id
    } else {
      projectList.value.push({
        id,
        opened: new Date(),
        remote: true
      })
      skipUpdate.value = true
      projectId.value = id
    }
  }

  function storeData(data) {
    localStorage.setItem(`wanderer-${projectId.value}`, JSON.stringify(data))
  }

  function addProject(id, data = { nodes: {}, edges: [] }) {
    const remote = settingsStore.remote

    if (!remote) {
      id = id ?? crypto.randomUUID()
      projectList.value.push({ id, remote, opened: new Date() })
      localStorage.setItem(`wanderer-${id}`, JSON.stringify(data))
      open(id)
    } else {
      if (socket == null) initSocket()
      socket.emit('create', data)
    }
  }

  function deleteProject(id, all) {
    if (!all) {
      projectList.value = projectList.value.filter((project) => project.id !== id)
      localStorage.removeItem(`wanderer-${id}`)
    } else {
      // update()
      const storage = { ...localStorage }
      Object.keys(storage)
        .filter((key) => /^wanderer-/.test(key))
        .forEach((key) => localStorage.removeItem(key))
      projectList.value = []
    }
    if (id === projectId.value || all) {
      projectId.value = null
    }
  }

  function exportProject(id) {
    const project = id && localStorage.getItem(`wanderer-${id}`)
    const blob = id && new Blob([project], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = `${id?.split('-')[0] ?? 'db'}.json`
    link.href = id ? window.URL.createObjectURL(blob) : constantStore.wandererStatic
    link.dataset.downloadurl = ['text/json', link.download, link.href].join(':')
    const evt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    })
    link.dispatchEvent(evt)
    link.remove()
  }

  async function duplicateProject(id) {
    const data = id
      ? JSON.parse(localStorage.getItem(`wanderer-${id}`))
      : await fetch(constantStore.wandererStatic).then((d) => d.json())

    addProject(null, data)
  }

  async function copyProjectLink(id) {
    const projectLink = `${window.location.origin}/share/${id}`

    await navigator.clipboard.writeText(projectLink)
  }

  const dataCopy = computed(() => {
    return cloneDeep(data.value)
  })

  watch(
    dataCopy,
    (value, oldValue) => {
      if (projectId.value == null) return
      if (!project.value.remote) return storeData(value)

      if (skipUpdate) return (skipUpdate = false)
      socket.emit('patch', compare(oldValue, value))

      // if (skipUpdate) return (skipUpdate = false)
      // socket.value.emit('update', compare(oldValue, value))
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
    socket,
    projects,
    importFromStatic,
    open,
    projectId,
    project,
    addProject,
    deleteProject,
    storeData,
    deleteNode,
    createNode,
    exportProject,
    duplicateProject,
    copyProjectLink
  }
})
