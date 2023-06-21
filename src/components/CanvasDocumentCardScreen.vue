<script setup>
import { computed } from 'vue'
import DocumentCard from './DocumentCard.vue'
import DocumentCardPlayButton from './DocumentCardPlayButton.vue'

import { useSyncStore } from '@/stores/sync'
import { useTerminusStore } from '@/stores/terminus'

const syncStore = useSyncStore()
const terminusStore = useTerminusStore()

const props = defineProps({
  allocation: Object
})

const x = computed(() => props.allocation.x)
const y = computed(() => props.allocation.y)

const type = computed(() => props.allocation.node['@type'])
const id = computed(() => props.allocation.node['@id'].replace(/[^/]+\//, ''))

const markers = computed(() =>
  terminusStore.markers.filter((marker) =>
    marker.state_change?.find((sc) => sc.node === props.allocation.node['@id'])
  )
)

const upcoming = computed(
  () =>
    type.value === 'graph' &&
    props.allocation.node['@id'] === terminusStore.graphDoc.next &&
    syncStore.time > syncStore.duration - 10
)

const currentMarker = computed(() => {
  const current = markers.value.reduce((a, b) => {
    if (b.timestamp - 1 / syncStore.framerate / 2 > syncStore.time) return a
    if (a == null) return b
    if (Math.abs(a.timestamp - syncStore.time) < Math.abs(b.timestamp - syncStore.time)) return a
    return b
  }, null)
  return current
})

const displayState = computed(() =>
  upcoming.value
    ? 'highlight'
    : currentMarker.value?.state_change?.find(
        (stateChange) => stateChange.node === props.allocation.node['@id']
      )?.state || 'inactive'
)
</script>

<template>
  <foreignObject width="100" height="100" :x="x" :y="y">
    <RouterLink
      v-if="allocation.node['@type'] === 'graph'"
      :to="{ params: { type, id } }"
      class="button"
    >
      <DocumentCard :document="allocation.node" :class="[displayState]" showButtons>
        <template v-slot:center>
          <DocumentCardPlayButton :countdown="upcoming" />
        </template>
      </DocumentCard>
    </RouterLink>
    <DocumentCard v-else :document="allocation.node" :class="[displayState]" />
  </foreignObject>
</template>

<style lang="scss" scoped>
foreignObject > section.document,
foreignObject > a > section.document {
  transform: translate(-50%, -50%);
  // outline: 3px solid var(--secondary);

  transition: all 0.2s;
  &.hidden {
    color: var(--hidden);
    // border: none;
  }
  &.inactive {
    // color: var(--inactive);
    // border: none;
    // filter: blur(15px);

    // color: var(--flow-color-inactive);

    &:not(:hover) {
      filter: blur(15px);

      color: var(--flow-color-inactive);
    }
  }
  &.active {
    // color: var(--primary);
    // border: none;
  }
  &.highlight {
    color: var(--flow-color-highlight);
    background: var(--flow-background-highlight);
  }

  .button-group {
    display: flex;
    gap: var(--spacing);
  }
}
</style>
