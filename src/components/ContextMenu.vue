<script setup>
import { useContextMenuStore } from '@/stores/contextMenu'
const contextMenuStore = useContextMenuStore()
</script>

<template>
  <div
    class="anchor"
    :style="{
      left: `${contextMenuStore.offset.x}px`,
      top: `${contextMenuStore.offset.y}px`
    }"
  />
  <component
    :is="contextMenuStore.component"
    class="context-menu"
    v-if="contextMenuStore.show"
    :context="contextMenuStore.context"
    :style="{
      '--transform': `translate(${contextMenuStore.offset.x}px, ${contextMenuStore.offset.y - 5}px)`
    }"
  />
  <!-- </div> -->
</template>

<style scoped>
.anchor {
  display: none;
  @supports (anchor-name: --anchor-context-menu) {
    display: initial;
    position: absolute;
    anchor-name: --anchor-context-menu;
  }
}
.context-menu {
  transform: var(--transform);
  position: absolute;
  z-index: 1;
  @supports (anchor-name: --anchor-context-menu) {
    position-anchor: --anchor-context-menu;
    transform: none;

    inset-area: right bottom;
    margin: -5px 0 0 0;
    position-try-options:
      flip-block,
      flip-inline,
      flip-block flip-inline;
  }
}
</style>
