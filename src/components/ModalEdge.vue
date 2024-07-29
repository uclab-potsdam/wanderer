<script setup>
import { useModalStore } from '@/stores/modal'
import InputDictionary from './InputDictionary.vue'
import InputSegment from './InputSegment.vue'
import ListWrapper from './ListWrapper.vue'

const arrows = [{ label: '–', value: null }, '→', '←', '↔']

const modalStore = useModalStore()
</script>

<template>
  <InputDictionary label="label" v-model="modalStore.item.label" />
  <InputSegment
    label="arrow"
    horizontal
    v-model="modalStore.item.arrow"
    :options="arrows"
    equal-size
  />
</template>

<style scoped>
.modal-edge {
}
</style>
