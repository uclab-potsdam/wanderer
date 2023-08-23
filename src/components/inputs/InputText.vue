<script setup>
import { idgen } from '@/assets/js/utils'
import { ref } from 'vue'

defineProps(['modelValue', 'options', 'label', 'secondaryLabel', 'placeholder'])
defineEmits(['update:modelValue'])

const name = idgen()
const input = ref(null)
function setFocus() {
  input.value.focus()
}
</script>
<template>
  <div class="input-text" @click="setFocus()">
    <label :for="name">
      <span> {{ label }} </span>
      <span> {{ secondaryLabel }} </span>
    </label>
    <div class="input-field">
      <slot></slot>
      <input
        :placeholder="placeholder"
        :name="name"
        :value="modelValue"
        ref="input"
        @input="$emit('update:modelValue', $event.target.value)"
        v-bind="options"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-text {
  background: var(--ui-backdrop);
  border-radius: var(--ui-border-radius);
  display: grid;
  padding: var(--spacing-s);

  label {
    font-size: var(--font-size-s);
    color: var(--ui-text-muted);
    display: flex;
    justify-content: space-between;
  }

  .input-field {
    display: flex;
    align-items: center;
    gap: var(--spacing-s);
  }

  input {
    all: unset;
    font-size: var(--font-size);
    // border-bottom: 1px solid currentColor;
    padding-top: var(--spacing-xs);

    &::placeholder {
      color: var(--ui-text);
    }

    &:focus {
      color: var(--ui-accent-dark);
      &::placeholder {
        color: var(--ui-text-muted);
      }
    }
  }

  &:focus-within,
  &:focus-within label {
    color: var(--ui-accent-dark);
  }
}
</style>
