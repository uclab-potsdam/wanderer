<script setup>
import { useModalStore } from '@/stores/modal'
import ModalNode from '@/components/ModalNode.vue'
import ModalEdge from '@/components/ModalEdge.vue'
import ListWrapper from './ListWrapper.vue'
// import { useSettingsStore } from '@/stores/settings'

const modalStore = useModalStore()
// const settingsStore = useSettingsStore()
</script>

<template>
  <div class="modal" v-if="modalStore.show" @click="modalStore.close()">
    <ListWrapper @click.stop>
      <ModalNode v-if="modalStore.type === 'node'" />
      <ModalEdge v-if="modalStore.type === 'edge'" />
    </ListWrapper>
  </div>
</template>

<style scoped>
.modal {
  position: absolute;
  width: 100vw;
  height: 100vh;
  z-index: 1;

  /* backdrop-filter: var(--blur); */
  /* background: color-mix(in lab, var(--ui-accent), rgba(0, 0, 0, 0.2) 90%); */

  display: grid;
  grid-template-columns:
    1fr
    [modal-start] min(100% - var(--spacing), 300px)
    [modal-end] 1fr;
  grid-template-rows: 1fr [modal-start] auto [modal-end] 1fr;

  > * {
    grid-column: modal-start / modal-end;
    grid-row: modal-start / modal-end;
    display: flex;
    flex-direction: column;
    text-align: start;
  }
}
</style>
