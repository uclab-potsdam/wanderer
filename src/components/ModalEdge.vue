<script setup>
import { useModalStore } from '@/stores/modal'
import InputSelect from './InputSelect.vue'

const arrows = [{ label: 'none', value: null }, '→', '←', '↔']

const modalStore = useModalStore()
</script>

<template>
  <div class="modal-node">
    <InputSelect label="arrow" v-model="modalStore.item.arrow" :options="arrows" />
  </div>
</template>

<style scoped>
.modal-node {
}
</style>
