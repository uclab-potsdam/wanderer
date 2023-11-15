<script setup>
import IconRaiseLevel from '~icons/base/RaiseLevel'
import { useSyncStore } from '@/stores/sync'
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'

const syncStore = useSyncStore()
const terminusStore = useTerminusStore()
const viewStore = useViewStore()
const props = defineProps(['allocation', 'level'])

function raiseLevel(e) {
  terminusStore.setState(
    syncStore.atMarker,
    props.allocation.node['@id'],
    ((props.level ?? viewStore.stateLevelDefault) + (e.shiftKey ? viewStore.stateLevelCount - 1 : 1)) %
      viewStore.stateLevelCount
  )
}
</script>
<template>
  <IconRaiseLevel
    :class="{ flip: viewStore.keyPressedShift }"
    v-if="syncStore.atMarker"
    @click.stop="raiseLevel"
    @dblclick.stop
  />
</template>
<style lang="scss" scoped>
.flip {
  transform: scale(-1);
}
</style>
