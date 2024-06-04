<script setup>
import { useModalStore } from '@/stores/modal'
import schema from '@/assets/js/schema'
import { computed } from 'vue'
import InputText from './InputText.vue'
import InputSelect from './InputSelect.vue'
import InputDictionary from './InputDictionary.vue'

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
  <div class="modal-node">
    <template v-for="(value, key) in fields" :key="key">
      <InputText v-if="value === 'string'" :label="key" v-model="modalStore.item[key]" />
      <InputDictionary
        v-else-if="value === 'dictionary'"
        :label="key"
        v-model="modalStore.item[key]"
      />
      <InputSelect
        v-else-if="value === 'color'"
        :label="key"
        v-model="modalStore.item[key]"
        :options="colors"
      />
    </template>
  </div>
</template>

<style scoped>
.modal-node {
}
</style>
