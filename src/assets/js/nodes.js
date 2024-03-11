import GraphNodeEntity from '@/components/GraphNodeEntity.vue'
import GraphNodeDefault from '@/components/GraphNodeDefault.vue'
import GraphNodeGraph from '@/components/GraphNodeGraph.vue'
import GraphNodeImage from '@/components/GraphNodeImage.vue'
import GraphNodePredicate from '@/components/GraphNodePredicate.vue'

export const types = {
  default: GraphNodeDefault,
  entity: GraphNodeEntity,
  graph: GraphNodeGraph,
  image: GraphNodeImage,
  predicate: GraphNodePredicate
}

export function getComponentForType(type) {
  return types[type] ?? types.default
}
