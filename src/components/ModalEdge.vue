<script setup>
import { useModalStore } from '@/stores/modal'
import InputSelect from './InputSelect.vue'
import InputDictionary from './InputDictionary.vue'

const arrows = [{ label: 'none', value: null }, '→', '←', '↔']

const modalStore = useModalStore()
</script>

<template>
  <div class="modal-node">
    <InputDictionary label="label" v-model="modalStore.item.label" />
    <InputSelect label="arrow" v-model="modalStore.item.arrow" :options="arrows" />
  </div>
</template>

<style scoped>
.modal-node {
}
</style>
