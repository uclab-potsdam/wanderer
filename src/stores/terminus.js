import { computed, ref } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { WOQLClient, WOQL } from '@terminusdb/terminusdb-client'
import { useViewStore } from './view'
import { ACCESS_NONE, ACCESS_READ, ACCESS_WRITE } from '@/assets/js/constants'

export const useTerminusStore = defineStore('terminus', () => {
  const viewStore = useViewStore()
  const schema = ref({})

  const allocations = ref([])
  const edges = ref([])

  const properties = ref([])
  const classes = ref([])
  const markers = ref([])

  const graph = ref([])
  const graphDoc = ref({})

  const currentLabel = ref({})

  let client = null

  async function connect(access) {
    const user =
      localStorage.getItem('USER') ||
      (access < ACCESS_WRITE ? import.meta.env.VITE_READ_USER : null)
    const key =
      localStorage.getItem('KEY') || (access < ACCESS_WRITE ? import.meta.env.VITE_READ_KEY : null)
    const server = import.meta.env.VITE_SERVER
    const organization = import.meta.env.VITE_ORGANIZATION
    const db = import.meta.env.VITE_DB

    if (user == null || key == null) return 'MISSING_CREDENTIALS'

    client = new WOQLClient(server, {
      user,
      [import.meta.env.VITE_AUTH_MODE]: key,
      organization,
      db
    })
    try {
      schema.value = await client.getSchemaFrame()
    } catch (error) {
      if (error.status === 401) return 'INCORRECT_CREDENTIALS'
      return 'UNEXPECTED ERROR'
    }
    getClasses()
    return 'SUCCESS'
  }

  // const connected = computed(() => {
  //   // return Object.keys(branches.value || {}).length > 0
  // })

  const access = computed(() => {
    return Object.keys(schema.value).length === 0
      ? ACCESS_NONE
      : client.user() === import.meta.env.VITE_READ_USER
      ? ACCESS_READ
      : ACCESS_WRITE
  })

  const languages = computed(() => {
    return schema.value.text?.['@metadata']?.languages || []
  })

  // const displayEdges = computed(() => {
  //   return edges.value
  //     .map((property) => {
  //       return {
  //         property,
  //         source: allocations.value.find(({ node }) => node['@id'] === property.subject),
  //         target: allocations.value.find(({ node }) => node['@id'] === property.object)
  //       }
  //     })
  //     .filter((d) => d.source != null && d.target != null)
  // })

  async function addDocument(document) {
    const res = await client.addDocument(document)
    return res
  }

  async function updateDocument(document) {
    const res = await client.updateDocument(document)
    return res
  }

  async function deleteDocument(id) {
    const res = await client.deleteDocument({ id })
    return res
  }

  async function addAllocation(node, graph, coordinates) {
    const allocation = allocations.value.find((allocation) => allocation.node['@id'] === node)

    const snapping = true
    const gridSize = snapping ? 62.5 : 0.5
    const snapTo = {
      x: Math.round(coordinates.x / gridSize) * gridSize,
      y: Math.round(coordinates.y / gridSize) * gridSize
    }

    if (allocation != null) {
      allocation.x = snapTo.x
      allocation.y = snapTo.y
    }
    await client.updateDocument(
      {
        '@type': 'allocation',
        node,
        graph,
        ...snapTo
      },
      { create: true },
      null,
      undefined,
      '',
      false,
      false,
      true
    )
    if (allocation == null) {
      getGraph(graph)
    }
    // const res = await client.getDocument({
    //   as_list: true,
    //   type: "Allocation",
    //   query: { context },
    // });
  }

  async function addEdge(source, target) {
    const edge = { source, target, graph: graph.value }
    edges.value.push(resolveEdge(edge))

    const res = await client.updateDocument(
      {
        '@type': 'edge',
        ...edge
      },
      { create: true },
      null,
      undefined,
      '',
      false,
      false,
      true
    )
    edges.value.splice(-1, 1, {
      ...resolveEdge({ ...edge, '@id': res[0].replace(/^terminusdb:\/\/\/data\//, '') })
    })
  }

  async function addMarker(timestamp) {
    await client.addDocument({
      '@type': 'marker',
      graph: graph.value,
      timestamp
    })
    getMarkers()
  }

  async function deleteMarker(id) {
    await deleteDocument(id)
    getMarkers()
  }

  async function getMarkers() {
    markers.value = await client.getDocument({
      as_list: true,
      query: { '@type': 'marker', graph: graph.value }
    })
  }

  async function getGraph(id, clear = false) {
    graphDoc.value = await getDocument(id)
    graph.value = id
    if (clear.value) allocations.value = []
    const nodes = await client.query(
      WOQL.triple('v:allocation', 'rdf:type', '@schema:allocation')
        .triple('v:allocation', 'graph', id)
        .triple('v:allocation', 'node', 'v:node_id')
        .triple('v:allocation', 'x', 'v:x')
        .triple('v:allocation', 'y', 'v:y')
        .read_document('v:node_id', 'v:node')
    )

    allocations.value = nodes.bindings.map(({ node, x, y, allocation }) => ({
      '@id': allocation,
      node,
      x: x['@value'],
      y: y['@value']
    }))

    const entityIds = allocations.value.map(({ node }) => node['@id'])

    const edgeData = await client.query(
      WOQL.triple('v:edge_id', 'rdf:type', '@schema:edge')
        .and(
          WOQL.once(WOQL.or(...entityIds.map((id) => WOQL.triple('v:edge_id', 'source', id)))),
          WOQL.once(WOQL.or(...entityIds.map((id) => WOQL.triple('v:edge_id', 'target', id))))
        )
        .read_document('v:edge_id', 'v:edge')
    )

    edges.value = edgeData.bindings
      .map(({ edge }) => resolveEdge(edge))
      .filter((d) => d.source != null && d.target != null)

    await Promise.all([getProperties(), getClasses(), getMarkers()])
  }

  async function getLabel(id) {
    const res = await client.query(
      WOQL.triple(id, 'label', 'v:label_id').read_document('v:label_id', 'v:label')
    )
    currentLabel.value = res.bindings[0]?.label
  }

  function resolveEdge(edge) {
    return {
      edge,
      source: allocations.value.find(({ node }) => node['@id'] === edge.source),
      target: allocations.value.find(({ node }) => node['@id'] === edge.target)
    }
  }

  async function getMedia(id) {
    const res = await getDocument(id)
    if (res['@type'] === 'media') return res
    if (res['@type'] === 'graph' && res.media != null) return await getDocument(res.media)
  }

  async function getProperties() {
    const res = await getDocumentsByType('property')
    properties.value = res
  }

  async function getClasses() {
    const res = await getDocumentsByType('class')
    classes.value = res
  }

  async function getDocument(id) {
    return (
      await client.getDocument({
        as_list: true,
        id
      })
    )[0]
  }

  async function getDocumentsByType(type) {
    return (
      await Promise.all(
        [type].flat().map(async (t) =>
          client.getDocument({
            as_list: true,
            query: { '@type': t }
          })
        )
      )
    )
      .flat()
      .reverse()
  }

  async function setStateChange(marker, id, state) {
    const stateChanges = marker.state_change?.filter((stateChange) => stateChange.node !== id) ?? []
    if (state != null) stateChanges.push({ '@type': 'state-change', node: id, state: state })

    await client.updateDocument({
      ...marker,
      state_change: stateChanges
    })

    getMarkers()
  }

  async function search(term, type) {
    const res = await client.query(
      WOQL.select('v:doc')
        .limit(16)
        .order_by(['v:dist', 'desc'])
        .triple('v:id', '@schema:label', 'v:text')
        .triple('v:id', 'rdf:type', `@schema:${type}`)
        .once(
          WOQL.or(
            ...viewStore.userLanguages.map((lang) =>
              WOQL.triple('v:text', `@schema:${lang}`, 'v:label')
            )
          )
        )
        .like(term, 'v:label', 'v:dist')
        .greater('v:dist', 0.6)
        .read_document('v:id', 'v:doc')
    )
    return res.bindings.map(({ doc }) => doc)
  }

  function pushBackAllocation(allocation) {
    allocations.value.push(allocations.value.splice(allocations.value.indexOf(allocation), 1)[0])
  }

  return {
    connect,
    access,
    schema,
    languages,
    allocations,
    edges,
    graph,
    graphDoc,
    addDocument,
    updateDocument,
    deleteDocument,
    addAllocation,
    addEdge,
    getGraph,
    getDocument,
    getDocumentsByType,
    search,
    pushBackAllocation,
    getProperties,
    getClasses,
    properties,
    classes,
    currentLabel,
    getLabel,
    getMedia,
    addMarker,
    getMarkers,
    markers,
    deleteMarker,
    setStateChange
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTerminusStore, import.meta.hot))
}
