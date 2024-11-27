import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useConfigStore } from './config'
import { useSettingsStore } from './settings'

import cloneDeep from 'lodash.clonedeep'

export const useDataStore = defineStore('data', () => {
  const configStore = useConfigStore()
  const settingsStore = useSettingsStore()
  const data = ref(null)
  const nodeId = ref(null)
  const storyId = ref(null)
  const storyIdForce = ref(null)

  const about = ref(null)

  async function init() {
    data.value = await fetch(configStore.wandererStatic).then((d) => d.json())
    if (settingsStore.mode !== 'public' && localStorage.getItem(`wanderer:data`) != null) {
      const localData = JSON.parse(localStorage.getItem(`wanderer:data`))
      if (
        data.value.exported === localData.exported ||
        !window.confirm(
          'Your local changes are based on a dataset version that does not match the public version. Do you want to discard your local changes and make a local copy of the latest public version?'
        )
      ) {
        data.value = localData
      } else {
        localStorage.setItem(`wanderer:data`, JSON.stringify(data.value))
      }
    }
    // setting languages if unset / not compatible
    if (!data.value.config.languages.text.map((t) => t.key).includes(settingsStore.lang)) {
      settingsStore.lang = data.value.config.languages.text[0].key
    }
    if (!data.value.config.languages.video.map((t) => t.key).includes(settingsStore.videoLang)) {
      settingsStore.videoLang = data.value.config.languages.video[0].key
    }

    if (data.value?.config?.about) {
      Object.entries(data.value?.config?.about).forEach(([lang, url]) => {
        fetch(expandUrl(url))
          .then((d) => d.text())
          .then((t) => {
            about.value = { ...about.value, [lang]: t }
          })
      })
    }
  }

  const kiosk = computed(() => data.value?.config?.kiosk)

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
    () => init()
  )

  function storeData(data) {
    localStorage.setItem('wanderer:data', JSON.stringify(data))
  }

  function deleteLocalChanges() {
    localStorage.removeItem('wanderer:data')
    settingsStore.mode = 'public'
  }

  function exportProject() {
    const project = JSON.parse(localStorage.getItem(`wanderer:data`))
    project.exported = new Date().getTime()
    const projectJSON = JSON.stringify(project, null, 2)
    const blob = new Blob([projectJSON], { type: 'application/json' })
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

  function importProject(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.addEventListener('load', (event) => {
        try {
          const db = JSON.parse(event.target.result)

          const valid = db.config?.languages != null && db.nodes != null && db.edges != null
          if (!valid) {
            alert('file not compatible')
            reject()
          } else {
            data.value = db
            localStorage.setItem('wanderer:data', event.target.result)
            alert('file imported')
            resolve(db)
          }
        } catch (error) {
          console.error(error)
          alert('file not compatible')
          reject()
        }
      })

      reader.addEventListener('error', (error) => {
        console.error(error)
      })
      reader.readAsText(file)
    })
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
    if (node.type === 'graph') node.allocations = {}
    data.value.nodes[id] = node
    return id
  }

  function expandUrl(url) {
    const prefix = Object.entries(data.value.config.shorthands).find((shorthand) =>
      new RegExp(`^${shorthand[0]}:`).test(url)
    )
    if (!prefix) return url
    return url.replace(`${prefix[0]}:`, prefix[1])
  }

  return {
    init,
    data,
    dataCopy,
    node,
    nodes,
    graphs,
    nodeId,
    storyId,
    nodeOccurances,
    storeData,
    deleteNode,
    createNode,
    exportProject,
    importProject,
    deleteLocalChanges,
    storyIdForce,
    about,
    kiosk
  }
})
