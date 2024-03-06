import GraphNodeEntity from '@/components/GraphNodeEntity.vue'
import GraphNodeDefault from '@/components/GraphNodeDefault.vue'

export const types = {
  entity: GraphNodeEntity,
  default: GraphNodeDefault
}

export function getComponentForType(type) {
  return types[type] ?? types.default
}
