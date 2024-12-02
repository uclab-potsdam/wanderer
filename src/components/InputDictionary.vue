<script setup>
import { useConfigStore } from '@/stores/config'
import { useDataStore } from '@/stores/data'
import { useHelperStore } from '@/stores/helper'
import { useSettingsStore } from '@/stores/settings'

defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  label: String,
  type: {
    type: String,
    default: 'text'
  }
})
defineEmits(['update:modelValue'])
const settingsStore = useSettingsStore()
const helperStore = useHelperStore()
const configStore = useConfigStore()
const dataStore = useDataStore()

const id = crypto.randomUUID()
</script>
<template>
  <div class="input-text">
    <span class="labels">
      {{ label }}
      <span class="languages">
        <label
          v-for="lang in dataStore.data.config.languages[type]"
          :key="lang.key"
          :for="`${id}-${lang.key}`"
          :title="lang.label"
        >
          {{ lang.short ?? lang.key }}
        </label>
      </span>
    </span>
    <input
      v-for="lang in dataStore.data.config.languages[type]"
      :key="lang.key"
      :id="`${id}-${lang.key}`"
      type="text"
      :value="modelValue?.[lang.key]"
      :placeholder="helperStore.localize(modelValue)"
      @change="$emit('update:modelValue', { ...modelValue, [lang.key]: $event.target.value })"
    />
  </div>
</template>

<style scoped>
.input-text {
  padding: var(--spacing-quart);
  backdrop-filter: brightness(106%) saturate(10%);

  .labels {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-quart);
    font-size: var(--font-size-tiny);
    text-transform: uppercase;
    color: inherit;

    .languages {
      display: flex;
      gap: var(--spacing-quart);
    }
  }

  input {
    color: inherit;
    border: none;
    font: var(--serif);
    background: transparent;
    padding: 0;
    outline: none;
    /* visibility: hidden; */
    width: 0;

    &:focus {
      width: 100%;
      /* visibility: visible; */
    }
  }

  &:has(input:focus-visible) {
    outline: 1px solid var(--ui-accent);
  }

  &:not(:has(input:focus)) {
    input:first-of-type {
      width: 100%;
    }

    label:first-of-type {
      color: var(--ui-accent);
      text-decoration: underline;
    }
  }

  &:has(input:nth-of-type(1):focus) {
    label:nth-of-type(1) {
      color: var(--ui-accent);
      text-decoration: underline;
    }
  }
  &:has(input:nth-of-type(2):focus) {
    label:nth-of-type(2) {
      color: var(--ui-accent);
      text-decoration: underline;
    }
  }
  &:has(input:nth-of-type(3):focus) {
    label:nth-of-type(3) {
      color: var(--ui-accent);
      text-decoration: underline;
    }
  }
  &:has(input:nth-of-type(4):focus) {
    label:nth-of-type(4) {
      color: var(--ui-accent);
      text-decoration: underline;
    }
  }
  &:has(input:nth-of-type(5):focus) {
    label:nth-of-type(5) {
      color: var(--ui-accent);
      text-decoration: underline;
    }
  }
}
</style>
