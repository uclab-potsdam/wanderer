import GraphNodeEntity from '@/components/GraphNodeEntity.vue'
import GraphNodeDefault from '@/components/GraphNodeDefault.vue'
import GraphNodeGraph from '@/components/GraphNodeGraph.vue'

export const types = {
  default: GraphNodeDefault,
  entity: GraphNodeEntity,
  graph: GraphNodeGraph
}

export function getComponentForType(type) {
  return types[type] ?? types.default
}
