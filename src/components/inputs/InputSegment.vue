<script setup>
import { idgen } from '@/assets/js/utils'
defineProps({
  modelValue: [String, Boolean, Number],
  options: Array,
  label: String
})
defineEmits(['update:modelValue'])

const name = idgen()
</script>
<template>
  <div class="input-segment">
    <label v-for="(option, i) in options" :key="i">
      <template v-if="!option.slot">{{ option.label ?? option.value ?? option }}</template>
      <template v-else><slot :name="option.slot"></slot></template>
      <input
        type="radio"
        :name="name"
        :checked="(option.value ?? option) === modelValue"
        :value="option.value ?? option"
        @change="$emit('update:modelValue', option.value ?? option)"
      />
    </label>
  </div>
</template>

<style lang="scss" scoped>
.input-segment {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  text-align: center;
  align-self: center;

  background: var(--ui-backdrop-translucent);
  backdrop-filter: blur(7px);
  border-radius: var(--ui-border-radius);
  padding: var(--spacing-xs);
  gap: var(--spacing-xs);

  label {
    transition: all var(--ui-transition);
    padding: var(--spacing-s);
    border-radius: var(--ui-border-radius-s);
    outline: 1px solid transparent;
    outline-offset: -1px;
    display: flex;
    justify-content: center;
    cursor: pointer;

    &:hover {
      outline: 1px solid var(--ui-accent-dark);
      color: var(--ui-accent-dark);
    }
    &:has(input:checked) {
      background: var(--ui-accent-light);
      color: var(--ui-accent-deep);
      font-weight: var(--bold);
    }
    &:has(input:focus-visible) {
      outline: 1px solid var(--ui-accent-dark);
    }

    input {
      appearance: none;
    }
  }
}
</style>
