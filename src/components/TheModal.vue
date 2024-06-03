<script setup>
import { useModalStore } from '@/stores/modal'
import { useSettingsStore } from '@/stores/settings'

const modalStore = useModalStore()
const settingsStore = useSettingsStore()
</script>

<template>
  <div class="modal" v-if="modalStore.show" @click="modalStore.close()">
    <div class="inner" @click.stop>
      <input v-model="modalStore.entity.text[settingsStore.lang]" />
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: absolute;
  width: 100vw;
  height: 100vh;
  z-index: 1;

  backdrop-filter: blur(5px);
  background: color-mix(in lab, var(--color-background), transparent 50%);

  display: grid;
  grid-template-columns:
    1fr
    [modal-start] min(100% - var(--spacing), 400px)
    [modal-end] 1fr;
  grid-template-rows: 1fr [modal-start] auto [modal-end] 1fr;

  .inner {
    grid-column: modal-start / modal-end;
    grid-row: modal-start / modal-end;

    border-radius: calc(var(--spacing) * 0.25);

    height: 400px;
    background: var(--color-background);
    box-shadow: color-mix(in lab, var(--color-text), transparent 50%) 0px 0px
      calc(var(--spacing) * 0.25);
    /* border: 1px solid var(--color-text); */
  }
}
</style>
