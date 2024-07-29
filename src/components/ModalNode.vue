<script setup>
import { useModalStore } from '@/stores/modal'
import schema from '@/assets/js/schema'
import { computed } from 'vue'
import InputText from './InputText.vue'
import InputSelectNode from './InputSelectNode.vue'
import InputDictionary from './InputDictionary.vue'
import ListWrapper from './ListWrapper.vue'

const colors = [
  'gray',
  'blue-gray',
  'blue',
  'indigo',
  'violet',
  'magenta',
  'red',
  'orange',
  'gold',
  'yellow',
  'lime',
  'green',
  'teal',
  'cyan'
]

const modalStore = useModalStore()

const fields = computed(() => schema[modalStore.item.type])
</script>

<template>
  <template v-for="(type, key) in fields" :key="key">
    <InputText v-if="type === 'string'" :label="key" v-model="modalStore.item[key]" />
    <InputDictionary
      v-else-if="type === 'dictionary'"
      :label="key"
      v-model="modalStore.item[key]"
    />
    <InputSelectNode
      v-else-if="type === 'color'"
      :label="key"
      v-model="modalStore.item[key]"
      :options="colors"
    />
    <InputSelectNode v-else :type="type" :label="key" v-model="modalStore.item[key]" />
  </template>
</template>

<style scoped></style>
