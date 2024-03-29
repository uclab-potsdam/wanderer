import { computed, ref } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { AccessControl, WOQLClient, WOQL } from '@terminusdb/terminusdb-client'
import { map } from '@/assets/js/utils'

export const useTerminusStore = defineStore('terminus', () => {
  // const viewStore = useViewStore()
  const schema = ref(null)

  const allocations = ref([])
  const proxyAllocations = ref([])
  const edges = ref([])

  const properties = ref([])
  const classes = ref([])
  const markers = ref([])

  const graph = ref(null)
  const media = ref({})
  const graphDoc = ref({})

  const relatedGraphs = ref([])

  const currentLabel = ref({})
  const languageList = ref([])

  const offset = ref({ x: 0, y: 0, id: null })

  const userInfo = ref({
    raw: null,
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
      userInfo.value.raw = await accessControl.getTeamUserRoles(user, organization)
      userInfo.value.name = user
      isAuthorized.value = true

      client = new WOQLClient(server, {
        user,
        [import.meta.env.VITE_AUTH_MODE]: pass,
        organization,
        db
      })
      const dbDetails = await client.getDatabases().then((details) => details.find((d) => d.name === db))
      userInfo.value.roles = userInfo.value.raw.capability
        .filter((c) => c.scope.match(organization) || c.scope === dbDetails['@id'])
        .map((c) => c?.role)
        .flat()
    } catch (error) {
      if (error.status === 401) return 'INCORRECT_CREDENTIALS'
      return 'UNEXPECTED_ERROR'
    }

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

  async function deleteGraph(id) {
    const res = await client.query(
      // WOQL.read_document(id, 'v:doc')
      WOQL.delete_document(id).opt(
        WOQL.or(
          WOQL.triple('v:id', 'graph', id).delete_document('v:id'),
          WOQL.triple('v:id', 'node', id).delete_document('v:id')
        )
      )
    )
    return res
  }

  async function deleteEntity(id) {
    const res = await client.query(
      // WOQL.read_document(id, 'v:doc')
      WOQL.delete_document(id).opt(
        WOQL.or(
          WOQL.triple('v:allocation_id', 'rdf:type', '@schema:allocation')
            .triple('v:allocation_id', 'node', id)
            .delete_document('v:allocation_id'),
          WOQL.triple('v:edge_id', 'source', id).delete_document('v:edge_id'),
          WOQL.triple('v:edge_id', 'target', id).delete_document('v:edge_id'),
          WOQL.triple('v:marker_id', 'rdf:type', '@schema:marker')
            .triple('v:marker_id', 'state', 'v:state_id')
            .triple('v:state_id', 'node', id)
            .delete_document('v:state_id')
        )
      )
    )
    return res
  }

  async function deleteAllocation(id) {
    const res = await client.query(
      // WOQL.read_document(id, 'v:doc')
      WOQL.triple(id, 'node', 'v:node_id')
        .triple(id, 'graph', 'v:graph_id')
        .delete_document(id)
        .opt(
          WOQL.or(
            WOQL.triple('v:edge_id', 'source', 'v:node_id')
              .triple('v:edge_id', 'graph', 'v:graph_id')
              .delete_document('v:edge_id'),
            WOQL.triple('v:edge_id', 'target', 'v:node_id')
              .triple('v:edge_id', 'graph', 'v:graph_id')
              .delete_document('v:edge_id'),
            WOQL.triple('v:marker_id', 'rdf:type', '@schema:marker')
              .triple('v:marker_id', 'graph', 'v:graph_id')
              .triple('v:marker_id', 'state', 'v:state_id')
              .triple('v:state_id', 'node', 'v:node_id')
              .delete_document('v:state_id')
          )
        )
    )
    return res
  }

  async function updateAllocation(node, coordinates, local = false) {
    const allocation = allocations.value.find((allocation) => allocation.node['@id'] === node)

    const x = coordinates.x - offset.value.x
    const y = coordinates.y - offset.value.y
    const snapping = true
    const gridSize = snapping ? 62.5 / 4 : 0.5
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

  async function updateEdge(id, coordinates, local = false) {
    const edge = edges.value.find((edge) => edge['@id'] === id)

    const x = coordinates.x
    const y = coordinates.y
    const snapping = true
    const gridSize = snapping ? 62.5 / 4 : 0.5
    const snapTo = {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    }

    // if (allocation != null) {
    edge.x = snapTo.x
    edge.y = snapTo.y
    // }
    if (local) return

    const newEdge = {
      ...edge,
      ...snapTo
    }
    delete newEdge.color
    await client.updateDocument(newEdge)
    // if (allocation == null) {
    //   getGraph(graph.value)
    // }
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

  async function updateMarker(marker, timestamp) {
    const newMarker = {
      ...marker,
      timestamp
    }
    await client.updateDocument(newMarker)
    markers.value.splice(
      markers.value.findIndex((m) => m['@id'] === marker['@id']),
      1,
      newMarker
    )
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
    if (id == null) return
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
          .read_document('v:node_id', 'v:node')
          .opt(WOQL.triple('v:node_id', 'media', 'v:media_id').read_document('v:media_id', 'v:media')),
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
    const graphBinding = res.bindings.find((d) => d.graph != null)
    graphDoc.value = {
      ...graphBinding?.graph,
      media: graphBinding?.media
    }
    media.value = graphBinding?.media ?? {}
    const nodes = res.bindings
      .filter((b) => b.node != null)
      .map((allocation) => ({
        ...allocation,
        node: { ...allocation.node, media: allocation.media }
      }))
    edges.value = res.bindings
      .filter((b) => b.edge != null)
      .map(({ edge }) => ({ color: graphDoc.value.color, ...edge }))
      .filter((d) => d.source != null && d.target != null)
      .sort((a, b) => (a['@id'] < b['@id'] ? -1 : 1))

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

    allocations.value = nodes
      .map(({ node, x, y, allocation }) => ({
        '@id': allocation,
        node,
        x: x['@value'] + offset.value.x,
        y: y['@value'] + offset.value.y
      }))
      .sort((a, b) => (a.node['@id'] < b.node['@id'] ? -1 : 1))
  }

  async function getNetwork(id) {
    const res = await client.query(
      WOQL.or(
        // central node
        WOQL.read_document(id, 'v:center'),
        // edges 1st degree
        WOQL.group_by(['v:edge_id', 'v:node_id', 'v:node', 'v:color'], ['v:edge', 'node2_id', 'color2'], 'v:edge2')
          .or(
            WOQL.triple('v:edge_id', 'source', id).triple('v:edge_id', 'target', 'v:node_id'),
            WOQL.triple('v:edge_id', 'target', id).triple('v:edge_id', 'source', 'v:node_id')
          )
          // .read_document('v:edge_id', 'v:edge')
          // nodes 1st degree
          .read_document('v:node_id', 'v:node')
          // .opt(WOQL.triple('v:edge_id', 'graph', 'v:graph_id').triple('v:graph_id', 'color', 'v:color'))
          .opt(
            WOQL.or(
              WOQL.triple('v:edge2_id', 'source', 'v:node_id').triple('v:edge2_id', 'target', 'v:node2_id'),
              WOQL.triple('v:edge2_id', 'target', 'v:node_id').triple('v:edge2_id', 'source', 'v:node2_id')
            )
              .read_document('v:edge2_id', 'v:edge')
              .opt(WOQL.triple('v:edge2_id', 'graph', 'v:graph2_id').triple('v:graph2_id', 'color', 'v:color2'))
          ),
        WOQL.triple('v:allocation', 'rdf:type', '@schema:allocation')
          .triple('v:allocation', 'node', id)
          .triple('v:allocation', 'graph', 'v:graph_id')
          .read_document('v:graph_id', 'v:graph')
          .opt(WOQL.triple('v:graph_id', 'media', 'v:media_id').read_document('v:media_id', 'v:media'))
      )
    )

    const center = allocations.value.find((allocation) => allocation.node['@id'] === id) ?? {
      x: innerWidth / 2,
      y: innerHeight / 2,
      node: res.bindings.find((d) => d.center != null)?.center
    }

    offset.value = { x: center.x, y: center.y, id: center.node['@id'] }

    const satellites = res.bindings
      .filter((d) => d.node != null)
      .map(({ node, edge2 }) => ({
        ...allocations.value.find((allocation) => node['@id'] === allocation.node['@id']),
        node,
        next: edge2.map((e2) => ({
          edge: e2[0],
          node: e2[1],
          color: e2[2]
        }))
      }))
      // move existing nodes forward to assign new positions to them first
      .sort((a, b) => (a.x != null && b.x == null ? -1 : a.x == null && b.x != null ? 1 : 0))
      .filter((satellite, i, satellites) => i === satellites.findIndex((s) => s.node['@id'] === satellite.node['@id']))

    // clear proxyAllocations (used for loose edges in network view)
    proxyAllocations.value = []

    // calculate coordinates for radial layout, might need improvement to make more use of screen dimensions

    // const ratio = innerWidth / innerHeight
    // const radius = { x: Math.max(300 * ratio, innerWidth / 3), y: Math.max(300 / ratio, innerHeight / 3) }
    const radius = { x: Math.min(innerHeight, innerWidth) / 3, y: Math.min(innerHeight, innerWidth) / 3 }
    const minCoordinates = 9
    const coordinates = [...satellites, ...Array(Math.max(0, minCoordinates - satellites.length)).fill()]
      .map((satellite, i, satellites) => {
        const rotation = ((Math.PI * 2) / Math.max(satellites.length, minCoordinates)) * i
        return {
          value: {
            x: Math.cos(rotation) * radius.x + center.x,
            y: Math.sin(rotation) * radius.y + center.y,
            rotation
          },
          sort: Math.random()
        }
      })
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)

    const edgeProxy = {}
    // satellites should move as little as possible form their current position
    // could be improved to check against all positions and prioritise instead of remaining ones
    const satelliteAllocations = satellites.map((satellite) => {
      let index = 0
      if (satellite.x != null && satellite.y != null) {
        // get closest remaining coordinate
        index = coordinates
          .map((coordinate) => Math.pow(coordinate.x - satellite.x, 2) + Math.pow(coordinate.y - satellite.y, 2))
          // find index of closest
          .reduce(
            (accIndex, currentValue, currentIndex, values) =>
              currentValue >= values[accIndex] ? accIndex : currentIndex,
            -1
          )
      }
      const coordinate = coordinates.splice(index, 1)[0]
      satellite.next
        .filter((s) => s.node != center.node['@id'])
        .forEach((s, i, next) => {
          const range = 0.75
          const rotation =
            next.length === 1 ? coordinate.rotation : coordinate.rotation - range / 2 + (range / (next.length - 1)) * i

          const x = coordinate.x + Math.cos(rotation) * (radius.x / 2)
          const y = coordinate.y + Math.sin(rotation) * (radius.y / 2)

          if (satellite.node['@id'] === s.edge.source) {
            edgeProxy[s.edge['@id']] = {
              ...edgeProxy[s.edge['@id']],
              source: { x, y }
            }
          } else {
            edgeProxy[s.edge['@id']] = {
              ...edgeProxy[s.edge['@id']],
              target: { x, y }
            }
          }
        })
      return { ...satellite, ...coordinate }
    })

    const edgeData = res.bindings
      .filter((d) => d.node != null)
      .map(({ edge2 }) =>
        edge2.map((e2) => ({ ...e2[0], proxy: edgeProxy[e2[0]['@id']], color: e2[2]?.replace(/@schema:color\//, '') }))
      )
      .flat()
      // remove duplicates
      .filter((edge, i, edges) => edges.findIndex((e) => e['@id'] === edge['@id']) === i)
      .map((e1, i1, edges) => {
        let offset = 0
        let contradict = null
        let plurality = null
        const parallels = edges.filter(
          (e2) =>
            (e1.source === id || e1.target === id) &&
            ((e1.source === e2.source && e1.target === e2.target) ||
              (e1.source === e2.target && e1.target === e2.source))
        )
        if (parallels.length > 1) {
          let index = parallels.findIndex((p) => p['@id'] === e1['@id'])
          offset = map(index, 0, parallels.length - 1, -1, 1)
          plurality = parallels.length > 3
          contradict = e1.source !== parallels[0].source
        }
        return { ...e1, offset, contradict, plurality }
      })

    edges.value = edgeData.sort((a, b) => (a['@id'] < b['@id'] ? -1 : 1))

    allocations.value = [center, ...satelliteAllocations].sort((a, b) => (a.node['@id'] < b.node['@id'] ? -1 : 1))

    relatedGraphs.value = res.bindings.filter((d) => d.graph != null).map(({ graph, media }) => ({ ...graph, media }))
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

  async function refreshDocument(id) {
    const doc = await getDocument(id)
    const type = doc['@type']
    if (type === 'class' || type === 'property' || type === 'edge') {
      const collection = type === 'class' ? classes : type === 'property' ? properties : edges
      const index = collection.value.findIndex((d) => d['@id'] === doc['@id'])
      if (index === -1) {
        collection.value.push(doc)
      } else {
        collection.value.splice(index, 1, doc)
      }
    } else if (type === 'allocation' || type === 'entity' || type === 'graph') {
      await getGraph(graph.value)
    }
  }

  async function removeDocument(type, id) {
    if (type === 'class' || type === 'property' || type === 'edge') {
      const collection = type === 'class' ? classes : type === 'property' ? properties : edges
      const index = collection.value.findIndex((d) => d['@id'] === id)
      if (index !== -1) {
        collection.value.splice(index, 1)
      }
    } else if (type === 'allocation' || type === 'entity' || type === 'graph') {
      await getGraph(graph.value)
    }
  }

  async function getDocumentsByType(type) {
    if (type === 'graph') {
      const res = await client.query(
        WOQL.triple('v:id', 'rdf:type', `@schema:${type}`).once(
          WOQL.read_document('v:id', 'v:doc').opt(
            WOQL.triple('v:id', 'media', 'v:media_id').read_document('v:media_id', 'v:media')
          ),
          WOQL.read_document('v:id', 'v:doc')
        )
      )
      return res.bindings.map(({ doc, media }) => ({ ...doc, media }))
    }
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
        .opt(WOQL.triple('v:id', 'media', 'v:media_id').read_document('v:media_id', 'v:media'))
    )
    return res.bindings.map(({ doc, media }) => ({ ...doc, media }))
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
    proxyAllocations,
    edges,
    graph,
    graphDoc,
    addDocument,
    updateDocument,
    deleteDocument,
    updateAllocation,
    deleteAllocation,
    deleteGraph,
    deleteEntity,
    addEdge,
    updateEdge,
    getGraph,
    getNetwork,
    getDocument,
    refreshDocument,
    removeDocument,
    getDocumentsByType,
    search,
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
    updateMarker,
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
