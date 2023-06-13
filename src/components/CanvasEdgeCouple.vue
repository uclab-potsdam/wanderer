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
  <CanvasEdge
    :class="[state]"
    :edge="edge"
    :interactive="interactive"
    :display-remote-style="true"
  />
</template>

<style lang="scss" scoped>
.edge {
  :deep(path.edge-main),
  :deep(text) {
    transition: all 0.2s;
  }
  &.hidden {
    :deep(path.edge-main) {
      stroke: var(--hidden-couple);
    }
    :deep(text) {
      fill: var(--hidden-couple);
    }
  }
  &.inactive {
    :deep(path.edge-main) {
      stroke: var(--inactive);
    }
    :deep(text) {
      fill: var(--inactive);
    }
  }
  &.active {
    :deep(path.edge-main) {
      stroke: var(--primary);

      &.end {
        marker-end: url(#arrow);
      }
      &:not(.end) {
        marker-start: url(#arrow-flipped);
      }
    }
    :deep(text) {
      fill: var(--primary);
    }
  }
  &.highlight {
    :deep(path.edge-main) {
      stroke: var(--accent);

      &.end {
        marker-end: url(#arrow-accent);
      }
      &:not(.end) {
        marker-start: url(#arrow-accent-flipped);
      }
    }
    :deep(text) {
      fill: var(--accent);
    }
  }
}
</style>
