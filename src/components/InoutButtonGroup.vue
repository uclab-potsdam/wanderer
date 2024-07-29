<script setup>
import ListWrapper from '@/components/ListWrapper.vue'
import InputSegmentItem from './InputSegmentItem.vue'
defineProps({
  modelValue: [String, Boolean, Number],
  options: Array,
  label: String,
  name: String,
  horizontal: Boolean
})
defineEmits(['update:modelValue'])
</script>
<template>
  <ListWrapper :horizontal="horizontal">
    <label class="label" v-for="(option, i) in options" :key="i">
      <InputSegmentItem v-if="!option.slot">
        {{ option.label ?? option.value ?? option }}
      </InputSegmentItem>
      <slot v-else :name="option.slot" />
      <input
        type="radio"
        :name="name"
        :checked="(option.value ?? option) === modelValue"
        :disabled="option.disabled"
        :value="option.value ?? option"
        @change="$emit('update:modelValue', option.value ?? option)"
      />
    </label>
  </ListWrapper>
</template>

<style scoped>
.label {
  border-radius: var(--border-radius-small);

  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:has(input:checked),
  &:hover:not(:has(input:disabled)) {
    background: color-mix(in lab, var(--ui-accent), transparent 70%);
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
</style>
