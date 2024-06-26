<script setup>
import { useContextMenuStore } from '@/stores/contextMenu'
const contextMenuStore = useContextMenuStore()
</script>

<template>
  <component
    :is="contextMenuStore.component"
    class="context-menu"
    v-if="contextMenuStore.show"
    :style="{
      transform: `translate(${contextMenuStore.offset.x}px, ${contextMenuStore.offset.y - 5}px)`
    }"
    :context="contextMenuStore.context"
  />
</template>

<style scoped>
.context-menu {
  position: absolute;
  z-index: 1;
}
</style>
