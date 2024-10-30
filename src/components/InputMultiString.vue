<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  label: String
})
const emit = defineEmits(['update:modelValue'])

const id = crypto.randomUUID()

const proxy = computed({
  // getter
  get() {
    return [...props.modelValue, '']
  },
  // setter
  set(value) {
    console.log('huhu')
    emit(
      'update:modelValue',
      value.filter((v) => v.trim() !== '')
    )
  }
})

function setValue(index, value) {
  console.log(index, value)
  // proxy.value[index] = value
  proxy.value = proxy.value.toSpliced(index, 1, value)
}
</script>
<template>
  <div class="input-text">
    <span class="labels">
      {{ label }}
      <span class="languages">
        <label v-for="(item, i) in proxy" :key="i" :for="`${id}-${i}`">
          {{ i }}
        </label>
      </span>
    </span>
    <input
      v-for="(value, i) in proxy"
      :key="i"
      :id="`${id}-${i}`"
      type="text"
      :value="value"
      @input="setValue(i, $event.target.value)"
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
