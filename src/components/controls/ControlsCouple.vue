<script setup>
import IconMarkerAdd from '~icons/base/MarkerAdd'
import IconMarkerRemove from '~icons/base/MarkerRemove'
import IconMarkerPrevious from '~icons/base/MarkerPrevious'
import IconMarkerNext from '~icons/base/MarkerNext'
import IconCapture from '~icons/base/Capture'
import IconCaptureRemove from '~icons/base/CaptureRemove'
import BaseButtonGroup from '../BaseButtonGroup.vue'
import BaseButton from '../BaseButton.vue'
import ControlsMedia from './ControlsMedia.vue'

import { useTerminusStore } from '@/stores/terminus'
import { useSyncStore } from '@/stores/sync'
import { useCanvasStore } from '@/stores/canvas'

const terminusStore = useTerminusStore()
const syncStore = useSyncStore()
const canvasStore = useCanvasStore()

function addMarker() {
  terminusStore.addMarker(syncStore.time)
}

function deleteMarker() {
  terminusStore.deleteMarker(syncStore.atMarker['@id'])
}

function toggleMarker() {
  syncStore.atMarker ? deleteMarker() : addMarker()
}

function setBounds() {
  terminusStore.setBounds(syncStore.atMarker, syncStore.atMarker.bounds ? null : getBounds())
}

function showBounds() {
  canvasStore.bounds = getBounds()
}

function hideBounds() {
  canvasStore.bounds = null
}

function getBounds() {
  const offset = 55
  const width = (innerWidth - offset * 2) / canvasStore.transform.k
  const height = (innerHeight - offset * 2) / canvasStore.transform.k
  const tl = {
    x: (-canvasStore.transform.x + 55) / canvasStore.transform.k - terminusStore.offset.x,
    y: (-canvasStore.transform.y + 55) / canvasStore.transform.k - terminusStore.offset.y
  }
  const bounds = {
    x1: tl.x,
    x2: tl.x + width,
    y1: tl.y,
    y2: tl.y + height
  }
  console.log(bounds)
  return bounds
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
    <BaseButtonGroup>
      <BaseButton
        small
        control
        :disabled="!syncStore.atMarker"
        @click="setBounds"
        @mouseover="showBounds"
        @mouseout="hideBounds"
      >
        <IconCapture v-if="!syncStore.atMarker?.bounds" />
        <IconCaptureRemove v-else />
      </BaseButton>
    </BaseButtonGroup>
  </div>
</template>
<style lang="scss" scoped>
.couple {
  display: grid;
  grid-template-columns: 1fr auto auto;
  width: 100%;
  gap: calc(var(--spacing-s) + var(--spacing-xs));
}
</style>
