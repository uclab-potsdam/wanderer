<script setup>
import IconMarkerAdd from '~icons/base/MarkerAdd'
import IconMarkerRemove from '~icons/base/MarkerRemove'
import IconMarkerPrevious from '~icons/base/MarkerPrevious'
import IconMarkerNext from '~icons/base/MarkerNext'
import BaseButtonGroup from '../BaseButtonGroup.vue'
import BaseButton from '../BaseButton.vue'
import ControlsMedia from './ControlsMedia.vue'

import { useTerminusStore } from '@/stores/terminus'
import { useSyncStore } from '@/stores/sync'

const terminusStore = useTerminusStore()
const syncStore = useSyncStore()
// const isAtMarker = ref(false)

function addMarker() {
  terminusStore.addMarker(syncStore.time)
}

function deleteMarker() {
  terminusStore.deleteMarker(syncStore.atMarker['@id'])
}

function toggleMarker() {
  syncStore.atMarker ? deleteMarker() : addMarker()
}

function seekBackward() {
  const previous = terminusStore.markers.reduce((a, b) => {
    if (b.timestamp >= syncStore.time) return a
    if (a == null) return b
    if (Math.abs(a.timestamp - syncStore.time) < Math.abs(b.timestamp - syncStore.time)) return a
    return b
  }, null)
  syncStore.setTime(previous?.timestamp ?? 0)
}

function seekForward() {
  const next = terminusStore.markers.reduce((a, b) => {
    if (b.timestamp <= syncStore.time) return a
    if (a == null) return b
    if (Math.abs(a.timestamp - syncStore.time) < Math.abs(b.timestamp - syncStore.time)) return a
    return b
  }, null)
  syncStore.setTime(next?.timestamp ?? syncStore.duration - 1 / syncStore.framerate)
}
</script>
<template>
  <div class="couple">
    <ControlsMedia persistent mark />
    <BaseButtonGroup>
      <BaseButton small control @click="seekBackward"><IconMarkerPrevious /></BaseButton>
      <BaseButton small control @click="toggleMarker">
        <IconMarkerRemove v-if="syncStore.atMarker" />
        <IconMarkerAdd v-else />
      </BaseButton>
      <BaseButton small control @click="seekForward"><IconMarkerNext /></BaseButton>
    </BaseButtonGroup>
  </div>
</template>
<style lang="scss" scoped>
.couple {
  display: grid;
  grid-template-columns: 1fr auto;
  width: 100%;
  gap: calc(var(--spacing-s) + var(--spacing-xs));
}
</style>
