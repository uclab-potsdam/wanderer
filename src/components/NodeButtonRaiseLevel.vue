<script setup>
import IconRaiseLevel from '~icons/base/RaiseLevel'
import { useSyncStore } from '@/stores/sync'
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'

const syncStore = useSyncStore()
const terminusStore = useTerminusStore()
const viewStore = useViewStore()
const props = defineProps(['allocation', 'level'])

function raiseLevel() {
  terminusStore.setState(
    syncStore.atMarker,
    props.allocation.node['@id'],
    ((props.level ?? viewStore.stateLevelDefault) + 1) % viewStore.stateLevelCount
  )
}
</script>
<template>
  <IconRaiseLevel v-if="syncStore.atMarker" @click.stop="raiseLevel" @dblclick.stop />
</template>
<style lang="scss" scoped></style>
