<script setup>
import { useModalStore } from '@/stores/modal'
import ModalNode from '@/components/ModalNode.vue'
import ModalEdge from '@/components/ModalEdge.vue'
// import { useSettingsStore } from '@/stores/settings'

const modalStore = useModalStore()
// const settingsStore = useSettingsStore()
</script>

<template>
  <div class="modal" v-if="modalStore.show" @click="modalStore.close()">
    <ModalNode v-if="modalStore.type === 'node'" @click.stop />
    <ModalEdge v-if="modalStore.type === 'edge'" @click.stop />
  </div>
</template>

<style scoped>
.modal {
  position: absolute;
  width: 100vw;
  height: 100vh;
  z-index: 1;

  backdrop-filter: var(--blur);
  background: color-mix(in lab, var(--color-background), transparent 50%);

  display: grid;
  grid-template-columns:
    1fr
    [modal-start] min(100% - var(--spacing), 400px)
    [modal-end] 1fr;
  grid-template-rows: 1fr [modal-start] auto [modal-end] 1fr;

  > * {
    padding: var(--spacing);
    grid-column: modal-start / modal-end;
    grid-row: modal-start / modal-end;

    border-radius: var(--spacing-quart);

    /* height: 400px; */
    background: var(--color-background);
    box-shadow: color-mix(in lab, var(--color-text), transparent 50%) 0px 0px
      var(--spacing-quart);
    /* border: 1px solid var(--color-text); */
  }
}
</style>
