<script setup>
import { useHelperStore } from '@/stores/helper'
import { useSettingsStore } from '@/stores/settings'

defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  label: String
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
  padding: var(--spacing-quart);
  backdrop-filter: brightness(106%) saturate(10%);

  label {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-quart);
    font-size: var(--font-size-tiny);
    text-transform: uppercase;
    color: inherit;
  }

  input {
    color: inherit;
    border: none;
    font: var(--serif);
    background: transparent;
    padding: 0;
    outline: none;
  }

  &:has(input:focus-visible) {
    outline: 1px solid var(--ui-accent);
  }
}
</style>
