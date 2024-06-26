<script setup>
import { useHelperStore } from '@/stores/helper'
import { useSettingsStore } from '@/stores/settings'

defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  label: String,
  name: String
})
defineEmits(['update:modelValue'])
const settingsStore = useSettingsStore()
const helperStore = useHelperStore()
</script>
<template>
  <div class="input-text">
    <label>
      {{ label }}
      <input
        type="text"
        :value="modelValue?.[settingsStore.lang]"
        :placeholder="helperStore.localize(modelValue)"
        @change="
          $emit('update:modelValue', { ...modelValue, [settingsStore.lang]: $event.target.value })
        "
      />
    </label>
  </div>
</template>

<style scoped>
.input-text {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  text-align: center;
  align-self: center;
}
</style>
