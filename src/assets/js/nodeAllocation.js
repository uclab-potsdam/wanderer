import { useDataStore } from '@/stores/data'
import { useLayoutStore } from '@/stores/layout'
import { forceManyBody, forceSimulation, forceLink, forceCenter } from 'd3-force'

const dataStore = useDataStore()
const layoutStore = useLayoutStore()

function computeAllocations(id) {
  const depth = 2
  const offset = layoutStore.nodes[id] ?? {
    x: 0,
    y: 0
  }
  const neighbors = [...new Set(getNeighbors(id, depth).flat(depth + 1))]
  // const uniqueNeighbors = removeNeighborDuplicates([id, neighbors])

  const nodes = neighbors.map((node) => {
    return { id: node, ...getCoordinates(node) }
  })

  const simulation = forceSimulation(nodes)
    .force(
      'link',
      forceLink(
        dataStore.data.edges
          .filter((edge) => neighbors.includes(edge.nodes[0]) && neighbors.includes(edge.nodes[1]))
          .map((edge) => ({
            source: edge.nodes[0],
            target: edge.nodes[1]
          }))
      ).id((n) => n.id)
    )
    .force('charge', forceManyBody().strength(-5000))
    .force('center', forceCenter())
    .on('tick', () => {
      console.log(nodes)
    })
    .stop()

  for (let i = 0; i < 1000; i++) {
    simulation.tick()
  }
  // simulation.tick()

  return Object.fromEntries(nodes.map(({ id, x, y }) => [id, { x, y }]))

  function getCoordinates(node) {
    if (node === id) return offset
    if (layoutStore.nodes[node] != null) return layoutStore.nodes[node]
    const rad = Math.random() * Math.PI * 2
    return {
      x: offset.x + Math.cos(rad) * 250,
      y: offset.y + Math.sin(rad) * 250
    }
  }
}

function getNeighbors(id, depth = 1) {
  return [
    id,
    ...dataStore.data.edges
      .filter((edge) => edge.nodes.includes(id))
      .map((edge) => {
        const neighbor = edge.nodes.find((node) => node !== id)
        if (depth === 1) return neighbor
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
