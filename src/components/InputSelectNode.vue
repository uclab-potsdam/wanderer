<script setup>
import { useDataStore } from '@/stores/data'
import LocalizeText from './LocalizeText.vue'
import SearchableList from './SearchableList.vue'
import { ref } from 'vue'

defineProps({
  modelValue: [String, Boolean, Number],
  options: Array,
  label: String,
  name: String,
  type: { type: String, default: 'entity' }
})
const emit = defineEmits(['update:modelValue'])

const dataStore = useDataStore()

const showOptions = ref(false)

function select(id) {
  emit('update:modelValue', id)
  showOptions.value = false
}
</script>
<template>
  <button class="input-select-display" @click="showOptions = !showOptions">
    <label>
      {{ label }}
    </label>

    <span class="value"
      ><LocalizeText v-if="modelValue" :text="dataStore.data.nodes[modelValue]?.label" />
      <template v-else>–</template>
    </span>
    <!-- <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
      <option v-for="(option, i) in options" :key="i">
        {{ option.label ?? option.value ?? option }}
      </option>
    </select> -->
  </button>
  <SearchableList v-if="showOptions" none class="input-select" @select-item="select" />
</template>

<style scoped>
.input-select-display {
  backdrop-filter: brightness(106%) saturate(10%);
  /* background: transparent; */
  padding: var(--spacing-quart);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-quart);

  label {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-quart);
    font-size: var(--font-size-tiny);
    text-transform: uppercase;
    color: inherit;
  }

  .value {
    font: var(--serif);
  }

  @supports (anchor-name: --anchor-input-select) {
    anchor-name: --anchor-input-select;
  }
}

.input-select {
  position: absolute;
  z-index: 10;
  backdrop-filter: blur(7px);
  @supports (anchor-name: --anchor-input-select) {
    position-anchor: --anchor-input-select;
    transform: none;

    position-area: bottom;
    position-try-options: flip-block;
  }
}
</style>
