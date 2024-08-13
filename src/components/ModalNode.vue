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

const fields = computed(() => {
  return Object.entries(schema[modalStore.item.type]).map((d) => {
    return {
      key: d[0],
      label: d[0].replaceAll('.', ' '),
      type: d[1],
      value: getValue(modalStore.item, d[0])
    }
  })
})

function getValue(item, key) {
  const fragments = key.split(/\.(.*)/s)
  if (fragments.length > 1) return getValue(item[fragments[0]], fragments[1])
  return item?.[key]
}

function setValue(item, key, value) {
  const fragments = key.split(/\.(.*)/s)
  if (fragments.length > 1) {
    if (item[fragments[0]] == null) item[fragments[0]] = {}
    return setValue(item[fragments[0]], fragments[1], value)
  }
  item[key] = value
}
</script>

<template>
  <template v-for="field in fields" :key="field.label">
    <InputText
      v-if="field.type === 'string'"
      :label="field.label"
      :model-value="field.value"
      @update:modelValue="($event) => setValue(modalStore.item, field.key, $event)"
    />
    <InputDictionary
      v-else-if="field.type === 'dictionary'"
      :label="field.label"
      :model-value="field.value"
      @update:modelValue="($event) => setValue(modalStore.item, field.key, $event)"
    />
    <InputSelectNode
      v-else-if="field.type === 'color'"
      :label="field.label"
      :model-value="field.value"
      @update:modelValue="($event) => setValue(modalStore.item, field.key, $event)"
      :options="colors"
    />
    <InputSelectNode
      v-else
      :type="field.type"
      :label="field.label"
      :model-value="field.value"
      @update:modelValue="($event) => setValue(modalStore.item, field.key, $event)"
    />
  </template>
</template>

<style scoped></style>
