<script setup>
import { useContextMenuStore } from '@/stores/contextMenu'

const contextMenuStore = useContextMenuStore()
</script>

<template>
  <div
    class="context-menu"
    v-if="contextMenuStore.show"
    :style="{
      transform: `translate(${contextMenuStore.offset.x}px, ${contextMenuStore.offset.y}px)`
    }"
  >
    <button v-for="(option, i) in contextMenuStore.options" :key="i" @click="option.action">
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.context-menu {
  position: absolute;
  z-index: 1;
}
</style>
