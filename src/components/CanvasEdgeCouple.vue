<script setup>
import CanvasEdge from '@/components/CanvasEdge.vue'

import { computed } from 'vue'
import { useSyncStore } from '@/stores/sync'
import { useTerminusStore } from '@/stores/terminus'

const syncStore = useSyncStore()
const terminusStore = useTerminusStore()

const props = defineProps({ edge: Object, interactive: Boolean })

const sourceMarkers = computed(() =>
  terminusStore.markers.filter((marker) =>
    marker.state_change?.find((sc) => sc.node === props.edge.source.node['@id'])
  )
)

const currentSourceMarker = computed(() => {
  const current = sourceMarkers.value.reduce((a, b) => {
    if (b.timestamp - 1 / syncStore.framerate / 2 > syncStore.time) return a
    if (a == null) return b
    if (Math.abs(a.timestamp - syncStore.time) < Math.abs(b.timestamp - syncStore.time)) return a
    return b
  }, null)
  return current
})

const sourceState = computed(
  () =>
    currentSourceMarker.value?.state_change?.find(
      (stateChange) => stateChange.node === props.edge.source.node['@id']
    )?.state || 'inactive'
)

const targetMarkers = computed(() =>
  terminusStore.markers.filter((marker) =>
    marker.state_change?.find((sc) => sc.node === props.edge.target.node['@id'])
  )
)

const currentTargetMarker = computed(() => {
  const current = targetMarkers.value.reduce((a, b) => {
    if (b.timestamp - 1 / syncStore.framerate / 2 > syncStore.time) return a
    if (a == null) return b
    if (Math.abs(a.timestamp - syncStore.time) < Math.abs(b.timestamp - syncStore.time)) return a
    return b
  }, null)
  return current
})

const targetState = computed(
  () =>
    currentTargetMarker.value?.state_change?.find(
      (stateChange) => stateChange.node === props.edge.target.node['@id']
    )?.state || 'inactive'
)

const states = ['highlight', 'active', 'inactive', 'hidden']

const state = computed(() => {
  return states[Math.max(states.indexOf(sourceState.value), states.indexOf(targetState.value))]
})
</script>

<template>
  <CanvasEdge :class="[state]" :edge="edge" :interactive="interactive" />
</template>

<style lang="scss" scoped>
.edge {
  &.hidden {
    opacity: 0.1;
  }
  &.inactive {
    opacity: 0.3;
  }
  &.active {
    opacity: 0.7;
  }
  &.highlight {
    opacity: 1;
  }
}
</style>
