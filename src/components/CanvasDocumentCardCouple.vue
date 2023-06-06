<script setup>
import { computed } from 'vue'
import DocumentCard from './DocumentCard.vue'

import IconStateHidden from '~icons/default/StateHidden'
import IconStateInactive from '~icons/default/StateInactive'
import IconStateActive from '~icons/default/StateActive'
import IconStateHighlight from '~icons/default/StateHighlight'
import BaseButton from './BaseButton.vue'
import IconStateReset from '~icons/default/StateReset'

import { useSyncStore } from '@/stores/sync'
import { useTerminusStore } from '@/stores/terminus'

const syncStore = useSyncStore()
const terminusStore = useTerminusStore()

const props = defineProps({
  allocation: Object
})

const x = computed(() => props.allocation.x)
const y = computed(() => props.allocation.y)

const markers = computed(() =>
  terminusStore.markers.filter((marker) =>
    marker.state_change?.find((sc) => sc.node === props.allocation.node['@id'])
  )
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

const displayState = computed(
  () =>
    currentMarker.value?.state_change?.find(
      (stateChange) => stateChange.node === props.allocation.node['@id']
    )?.state || 'inactive'
)

const state = computed(
  () =>
    syncStore.currentMarker?.state_change?.find(
      (stateChange) => stateChange.node === props.allocation.node['@id']
    )?.state || null
)

function setStateChange(id, state) {
  terminusStore.setStateChange(syncStore.atMarker, id, state)
}
</script>

<template>
  <foreignObject width="100" height="100" :x="x" :y="y">
    <DocumentCard :document="allocation.node" :class="[displayState]" show-buttons>
      <template v-slot:center>
        <div class="button-group" v-if="!syncStore.playing && syncStore.atMarker != null">
          <BaseButton>
            <IconStateHidden @click="setStateChange(allocation.node['@id'], 'hidden')" />
          </BaseButton>
          <BaseButton>
            <IconStateInactive @click="setStateChange(allocation.node['@id'], 'inactive')" />
          </BaseButton>
          <BaseButton>
            <IconStateActive @click="setStateChange(allocation.node['@id'], 'active')" />
          </BaseButton>
          <BaseButton>
            <IconStateHighlight @click="setStateChange(allocation.node['@id'], 'highlight')" />
          </BaseButton>
        </div>
      </template>
      <template v-slot:right>
        <div
          class="button-group"
          v-if="!syncStore.playing && syncStore.atMarker != null && state != null"
        >
          <BaseButton>
            <IconStateReset @click="setStateChange(allocation.node['@id'], null)" />
          </BaseButton>
        </div>
      </template>
    </DocumentCard>
  </foreignObject>
</template>

<style lang="scss" scoped>
foreignObject > section.document {
  transform: translate(-50%, -50%);
  outline: 3px solid var(--secondary);

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

  .button-group {
    display: flex;
    gap: var(--spacing);
  }
}
</style>
