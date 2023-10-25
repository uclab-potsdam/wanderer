import { computed, ref } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { AccessControl, WOQLClient, WOQL } from '@terminusdb/terminusdb-client'
// import { useViewStore } from './view'

export const useTerminusStore = defineStore('terminus', () => {
  // const viewStore = useViewStore()
  const schema = ref(null)

  const allocations = ref([])
  const edges = ref([])

  const properties = ref([])
  const classes = ref([])
  const markers = ref([])

  const graph = ref([])
  const media = ref({})
  const graphDoc = ref({})

  const relatedGraphs = ref([])

  const currentLabel = ref({})
  const languageList = ref([])

  const offset = ref({ x: 0, y: 0, id: null })

  const userInfo = ref({
    name: null,
    roles: null
  })

  let client = null

  let isAuthorized = ref(false)

  async function connect(u, p) {
    const user = u ?? localStorage.getItem('USER') ?? import.meta.env.VITE_READ_USER
    const pass = p ?? localStorage.getItem('PASS') ?? import.meta.env.VITE_READ_PASS

    const server = import.meta.env.VITE_SERVER
    const organization = import.meta.env.VITE_ORGANIZATION
    const db = import.meta.env.VITE_DB
    const branch = import.meta.env.VITE_BRANCH

    const accessControl = new AccessControl(server, {
      organization,
      user,
      [import.meta.env.VITE_AUTH_MODE]: pass
    })

    try {
      userInfo.value.roles = await accessControl
        .getTeamUserRoles(user, organization)
        .then((r) => r.capability.find((c) => c.scope.match(organization))?.role)
      userInfo.value.name = user
      isAuthorized.value = true
    } catch (error) {
      if (error.status === 401) return 'INCORRECT_CREDENTIALS'
      return 'UNEXPECTED_ERROR'
    }

    client = new WOQLClient(server, {
      user,
      [import.meta.env.VITE_AUTH_MODE]: pass,
      organization,
      db
    })

    client.checkout(branch)
    // try {
    //   schema.value = await client.getSchemaFrame()
    // } catch (error) {
    //   if (error.status === 401) return 'INCORRECT_CREDENTIALS'
    //   return 'UNEXPECTED ERROR'
    // }
    // getClasses()
    getProperties()
    getClasses()
    return 'SUCCESS'
  }

  // const connected = computed(() => {
  //   // return Object.keys(branches.value || {}).length > 0
  // })

  const isAuthor = computed(() => {
    return userInfo.value.roles.some((r) => r.name === 'author')
  })

  const isSignedIn = computed(() => {
    return userInfo.value.name && userInfo.value.name !== import.meta.env.VITE_READ_USER
  })

  const languages = computed(() => {
    return schema.value?.text?.['@metadata']?.languages || []
  })

  const states = computed(() => {
    return markers.value
      .map((marker) => {
        return (marker.state ?? []).map((state) => {
          return {
            ...state,
            timestamp: marker.timestamp,
            marker: marker['@id']
          }
        })
      })
      .flat()
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

  async function updateAllocation(node, coordinates, local = false) {
    const allocation = allocations.value.find((allocation) => allocation.node['@id'] === node)

    const x = coordinates.x - offset.value.x
    const y = coordinates.y - offset.value.y
    const snapping = true
    const gridSize = snapping ? 62.5 : 0.5
    const snapTo = {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    }

    if (allocation != null) {
      allocation.x = snapTo.x + offset.value.x
      allocation.y = snapTo.y + offset.value.y
    }
    if (local) return
    await client.updateDocument(
      {
        '@type': 'allocation',
        node,
        graph: graph.value,
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
      getGraph(graph.value)
    }
    // const res = await client.getDocument({
    //   as_list: true,
    //   type: "Allocation",
    //   query: { context },
    // });
  }

  async function addEdge(source, target) {
    const edge = { source, target, graph: graph.value }
    edges.value.push(edge)

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
      ...edge,
      '@id': res[0].replace(/^terminusdb:\/\/\/data\//, '')
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
    markers.value = (
      await client.query(
        WOQL.order_by('v:ts')
          .triple('v:marker_id', 'rdf:type', '@schema:marker')
          .triple('v:marker_id', 'graph', graph.value)
          .triple('v:marker_id', 'timestamp', 'v:ts')
          .read_document('v:marker_id', 'v:marker')
      )
    ).bindings.map(({ marker }) => marker)

    // markers.value = client.getDocument({
    //   as_list: true,
    //   query: { '@type': 'marker', graph: graph.value }
    // })
  }

  async function getGraph(id, clear = false) {
    if (clear.value) allocations.value = []
    graph.value = id
    const res = await client.query(
      WOQL.or(
        // graph
        WOQL.read_document(id, 'v:graph').opt(
          WOQL.triple(id, 'media', 'v:media_id').read_document('v:media_id', 'v:media')
        ),
        // allocations/nodes
        WOQL.triple('v:allocation', 'rdf:type', '@schema:allocation')
          .triple('v:allocation', 'graph', id)
          .triple('v:allocation', 'node', 'v:node_id')
          .triple('v:allocation', 'x', 'v:x')
          .triple('v:allocation', 'y', 'v:y')
          .read_document('v:node_id', 'v:node'),
        // edges
        WOQL.triple('v:edge_id', 'rdf:type', '@schema:edge')
          .triple('v:edge_id', 'graph', id)
          .read_document('v:edge_id', 'v:edge'),
        // marker
        WOQL.order_by('v:ts')
          .triple('v:marker_id', 'rdf:type', '@schema:marker')
          .triple('v:marker_id', 'graph', graph.value)
          .triple('v:marker_id', 'timestamp', 'v:ts')
          .read_document('v:marker_id', 'v:marker')
      )
    )
    graphDoc.value = res.bindings.find((d) => d.graph != null)?.graph
    media.value = res.bindings.find((d) => d.graph != null)?.media ?? {}
    const nodes = res.bindings.filter((b) => b.node != null)
    edges.value = res.bindings
      .filter((b) => b.edge != null)
      .map(({ edge }) => edge)
      .filter((d) => d.source != null && d.target != null)
    markers.value = res.bindings.filter((b) => b.marker != null).map(({ marker }) => marker)

    // perpetuate offset to reduce movement
    const newPosition = nodes.find((binding) => binding.node['@id'] === offset.value.id)
    // could be optimized to use center point if newPosition is not available
    if (newPosition != null) {
      offset.value.x -= newPosition.x['@value']
      offset.value.y -= newPosition.y['@value']
    }
    // reset id to stop perpetuating offset from previous entity
    offset.value.id = null

    allocations.value = nodes.map(({ node, x, y, allocation }) => ({
      '@id': allocation,
      node,
      x: x['@value'] + offset.value.x,
      y: y['@value'] + offset.value.y
    }))
  }

  async function getNetwork(id) {
    const res = await client.query(
      WOQL.or(
        WOQL.read_document(id, 'v:center'),
        WOQL.or(
          WOQL.triple('v:edge_id', 'source', id).triple('v:edge_id', 'target', 'v:node_id'),
          WOQL.triple('v:edge_id', 'target', id).triple('v:edge_id', 'source', 'v:node_id')
        )
          .read_document('v:edge_id', 'v:edge')
          .read_document('v:node_id', 'v:node'),
        WOQL.triple('v:allocation', 'rdf:type', '@schema:allocation')
          .triple('v:allocation', 'node', id)
          .triple('v:allocation', 'graph', 'v:graph_id')
          .read_document('v:graph_id', 'v:graph')
      )
    )

    const center = allocations.value.find((allocation) => allocation.node['@id'] === id) ?? {
      x: innerWidth / 2,
      y: innerHeight / 2,
      node: res.bindings.find((d) => d.center != null)?.center
    }

    offset.value = { x: center.x, y: center.y, id: center.node['@id'] }

    const edgeData = res.bindings.filter((d) => d.edge != null).map(({ edge }) => edge)

    // in order to preserve existing positions only fetch nodes that are currently not allocated
    // const satelliteIds = edgeData.map((edge) => (edge.source === id ? edge.target : edge.source))
    // const exisitngSatellites = allocations.value.filter((allocation) =>
    //   satelliteIds.includes(allocation.node['@id'])
    // )
    // const remainingSatelliteIds = satelliteIds.filter(
    //   (id) => !exisitngSatellites.map((allocation) => allocation.node['@id']).includes(id)
    // )
    // const newSatellites =
    //   remainingSatelliteIds.length === 0
    //     ? []
    //     : (
    //         await client.query(
    //           WOQL.or(...remainingSatelliteIds.map((id) => WOQL.read_document(id, 'v:node')))
    //         )
    //       ).bindings.map(({ node }) => node)

    const satellites = res.bindings
      .filter((d) => d.node != null)
      .map(({ node }) => ({
        ...allocations.value.find((allocation) => node['@id'] === allocation.node['@id']),
        node
      }))
      // move existing nodes forward to assign new positions to them first
      .sort((a, b) => (a.x != null && b.x == null ? -1 : a.x == null && b.x != null ? 1 : 0))

    // calculate coordinates for radial layout, might need improvement to make more use of screen dimensions
    const radius = { x: 400, y: 400 }
    const minCoordinates = 9
    const coordinates = [...satellites, ...Array(Math.max(0, minCoordinates - satellites.length)).fill()]
      .map((satellite, i, satellites) => {
        return {
          value: {
            x: Math.cos(((Math.PI * 2) / Math.max(satellites.length, minCoordinates)) * i) * radius.x + center.x,
            y: Math.sin(((Math.PI * 2) / Math.max(satellites.length, minCoordinates)) * i) * radius.y + center.y
          },
          sort: Math.random()
        }
      })
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)

    // satellites should move as little as possible form their current position
    // could be improved to check against all positions and prioritise instead of remaining ones
    const satelliteAllocations = satellites.map((satellite) => {
      if (satellite.x == null || satellite.y == null) return { ...satellite, ...coordinates.splice(0, 1)[0] }

      // get closest remaining coordinate
      const index = coordinates
        .map((coordinate) => Math.pow(coordinate.x - satellite.x, 2) + Math.pow(coordinate.y - satellite.y, 2))
        // find index of closest
        .reduce(
          (accIndex, currentValue, currentIndex, values) =>
            currentValue >= values[accIndex] ? accIndex : currentIndex,
          -1
        )
      return { ...satellite, ...coordinates.splice(index, 1)[0] }
    })

    allocations.value = [center, ...satelliteAllocations]

    edges.value = edgeData.sort(
      (a, b) =>
        edges.value.findIndex((edge) => edge['@id'] === a['@id']) -
        edges.value.findIndex((edge) => edge['@id'] === b['@id'])
    )

    relatedGraphs.value = res.bindings.filter((d) => d.graph != null).map(({ graph }) => graph)
  }

  async function getLabel(id) {
    const res = await client.query(WOQL.triple(id, 'label', 'v:label_id').read_document('v:label_id', 'v:label'))
    return res.bindings[0]?.label
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

  async function getSchema() {
    if (schema.value == null) schema.value = await client.getSchemaFrame()
    return schema.value
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

  async function setState(marker, id, level) {
    const states = marker.state?.filter((state) => state.node !== id) ?? []
    if (level != null) states.push({ '@type': 'state', node: id, level })

    const newMarker = {
      ...marker,
      state: states
    }

    markers.value.splice(
      markers.value.findIndex((m) => m['@id'] === marker['@id']),
      1,
      newMarker
    )
    client.updateDocument(newMarker)
  }

  async function setBounds(marker, bounds) {
    const newMarker = {
      ...marker
    }
    delete newMarker.bounds
    if (bounds != null) {
      newMarker.bounds = {
        '@type': 'bounds',
        ...bounds
      }
    }

    markers.value.splice(
      markers.value.findIndex((m) => m['@id'] === marker['@id']),
      1,
      newMarker
    )
    client.updateDocument(newMarker)
  }

  async function search(term, type) {
    const res = await client.query(
      WOQL.select('v:doc')
        .limit(16)
        .order_by(['v:dist', 'desc'])
        .triple('v:id', '@schema:label', 'v:text')
        .triple('v:id', 'rdf:type', `@schema:${type}`)
        .once(WOQL.or(...languageList.value.map((lang) => WOQL.triple('v:text', `@schema:${lang}`, 'v:label'))))
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
    media,
    connect,
    userInfo,
    isAuthor,
    isSignedIn,
    isAuthorized,
    getSchema,
    schema,
    languages,
    languageList,
    allocations,
    edges,
    graph,
    graphDoc,
    addDocument,
    updateDocument,
    deleteDocument,
    updateAllocation,
    addEdge,
    getGraph,
    getNetwork,
    getDocument,
    getDocumentsByType,
    search,
    pushBackAllocation,
    offset,
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
    setState,
    setBounds,
    states,
    relatedGraphs
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTerminusStore, import.meta.hot))
}
