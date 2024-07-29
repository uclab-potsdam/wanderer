import { useDataStore } from '@/stores/data'
import { useLayoutStore } from '@/stores/layout'
import {
  forceManyBody,
  forceSimulation,
  forceLink,
  forceCenter,
  forceRadial,
  forceCollide
} from 'd3-force'

const dataStore = useDataStore()
const layoutStore = useLayoutStore()

function computeAllocations(id) {
  const depth = 2
  layoutStore.offset = layoutStore.nodes[id] ?? {
    x: 0,
    y: 0
  }

  const neighborsWithDuplicates = getNeighbors(id, depth).flat(depth + 1)
  const neighborsUniqueIds = [...new Set(neighborsWithDuplicates.map((d) => d.id))]
    // only show entities and predicates
    .filter((id) => ['entity', 'predicate'].includes(dataStore.data.nodes[id].type))
  const neighbors = neighborsUniqueIds.map((id) => {
    const depths = neighborsWithDuplicates.filter((n) => n.id === id).map(({ depth }) => depth)
    return { id, depth: depth - Math.max(...depths) }
  })
  // console.log(neighborsWithDepth)
  // const neighbors = [
  //   ...new Set(
  //     getNeighbors(id, depth)
  //       .flat(depth + 1)
  //       .map((d) => d.id)
  //   )
  // ]
  // console.log(neighbors)
  // const uniqueNeighbors = removeNeighborDuplicates([id, neighbors])

  const nodes = [
    ...neighbors.map(({ id, depth }) => {
      return { id, depth, ...getCoordinates(id) }
    }),
    ...Object.entries(dataStore.nodeOccurances)
      .map((graph) => {
        return [
          { id: graph[0], ...getCoordinates(graph[0]), depth: 2 },
          { id: `${graph[0]}-proxy`, ...getCoordinates(`${graph[0]}-proxy`), proxy: true, depth: 1 }
        ]
      })
      .flat()
  ]

  const edges = [
    ...dataStore.data.edges
      .filter(
        (edge) =>
          neighborsUniqueIds.includes(edge.nodes[0]) && neighborsUniqueIds.includes(edge.nodes[1])
      )
      .map((edge) => ({
        source: edge.nodes[0],
        target: edge.nodes[1]
      })),
    ...Object.entries(dataStore.nodeOccurances)
      .map((graph) => [
        {
          source: id,
          target: `${graph[0]}-proxy`
        },
        {
          source: `${graph[0]}-proxy`,
          target: graph[0]
        }
      ])
      .flat()
  ]

  const simulation = forceSimulation(nodes)
    .force(
      'link',
      forceLink(edges)
        .id((n) => n.id)
        .distance(100)
    )
    .force(
      'collide',
      forceCollide().radius((d) => (dataStore.data.nodes[d.id]?.type === 'graph' ? 160 : 50))
    )
    .force('charge', forceManyBody().strength(-5000))
    .force('center', forceCenter(0, 0))
    .force(
      'radial',
      // forceRadial(200)
      forceRadial((d) => d.depth * 200, 0, 0).strength(2)
    )
    .stop()

  for (let i = 0; i < 1000; i++) {
    // if (i === 900) simulation.force('collide', forceCollide(100))
    simulation.tick()
  }
  // simulation.tick()

  return Object.fromEntries(
    nodes.filter(({ proxy }) => !proxy).map(({ id, x, y }) => [id, { x, y }])
  )

  function getCoordinates(node) {
    if (node === id) return { x: 0, y: 0 }
    if (layoutStore.nodes[node] != null) return layoutStore.nodes[node]
    const rad = Math.random() * Math.PI * 2
    return {
      x: Math.cos(rad) * 250,
      y: Math.sin(rad) * 250
    }
  }
}

function getNeighbors(id, depth = 1) {
  return [
    { id, depth },
    ...dataStore.data.edges
      .filter((edge) => edge.nodes.includes(id))
      .map((edge) => {
        const neighbor = edge.nodes.find((node) => node !== id)
        if (depth === 1) return { id: neighbor, depth: 0 }
        return getNeighbors(neighbor, depth - 1)
      })
  ]
}

// function getNeighbors(id, depth = 1) {
//   const nodes = [
//     id,
//     ...dataStore.data.edges
//       .filter((edge) => edge.nodes.includes(id))
//       .map((edge) => edge.nodes.find((node) => node !== id))
//   ]

//   if (depth === 1) return nodes
//   return nodes.map((neighbor) => getNeighbors(neighbor, depth - 1))
// }

// function getNeighbors(id, depth = 1) {
//   const neighbors = dataStore.data.edges
//     .filter((edge) => edge.nodes.includes(id))
//     .map((edge) => edge.nodes.find((node) => node !== id))

//   if (depth === 1) return neighbors
//   return neighbors.map((neighbor) => [neighbor, getNeighbors(neighbor, depth - 1)])
// }

// function removeNeighborDuplicates(neighbors, level = 0) {
//   console.log(Array.isArray(neighbors[1]))
// }

// function getNeighbors(id, depth = 1, skip = []) {
//   skip.push(id)
//   console.log(skip)
//   const neighbors = dataStore.data.edges
//     .filter((edge) => edge.nodes.includes(id))
//     .map((edge) => edge.nodes.find((node) => node !== id))
//     .filter((node) => !skip.includes(node))

//   if (depth === 1) {
//     skip.push(...neighbors)
//     return neighbors
//   }

//   depth--
//   return neighbors.map((neighbor) => [neighbor, getNeighbors(neighbor, depth, skip)])
// }

// function getNeighbors(id, depth = 1, skip = []) {
//   skip.push(id)
//   return dataStore.data.edges
//     .filter((edge) => edge.nodes.includes(id))
//     .map((edge) => {
//       const neighborId = edge.nodes.find((node) => node !== id)
//       skip.push(neighborId)
//       console.log(skip)
//       if (depth <= 1) return neighborId
//       const nextNeighbors = getNeighbors(neighborId, depth - 1, skip)

//       return [neighborId, nextNeighbors]
//     })
//     .filter((node) => !skip.includes(node))
// }

export { computeAllocations }
