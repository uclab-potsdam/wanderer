<script setup>
import ListWrapper from '@/components/ListWrapper.vue'
import InputSegmentItem from './InputSegmentItem.vue'
import { nextTick, ref } from 'vue'
const props = defineProps({
  modelValue: [String, Boolean, Number],
  options: Array,
  label: String,
  name: String,
  horizontal: Boolean,
  equalSize: Boolean,
  collapse: Boolean
})

const isExpanded = ref(false)
const emit = defineEmits(['update:modelValue'])

function toggle(option) {
  // console.log(v, isExpanded.value)
  if (
    !isExpanded.value ||
    props.modelValue === (option.value === undefined ? option : option.value)
  ) {
    isExpanded.value = !isExpanded.value
  }

  // isExpanded.value = !isExpanded.value
  // console.log(v, isExpanded.value)
  // isExpanded.value = true
  // v.stopPropagation()
  // nextTick(() => nextTick(() => (isExpanded.value = !isExpanded.value)))
}

function onChange(option) {
  console.log('change', option)
  emit('update:modelValue', option.value === undefined ? option : option.value)
  isExpanded.value = false
}
</script>
<template>
  <ListWrapper :horizontal="horizontal" :equal-size="equalSize" :hide="collapse && !isExpanded">
    <label
      class="label"
      :class="{ collapse }"
      v-for="option in options.filter(
        (o) => !collapse || isExpanded || (o.value === undefined ? o : o.value) === modelValue
      )"
      :key="option.value === undefined ? option : option.value"
      :title="option.tooltip"
    >
      <InputSegmentItem v-if="!option.slot">
        {{ option.label ?? option.value ?? option }}
      </InputSegmentItem>
      <slot v-else :name="option.slot" />
      <input
        type="radio"
        :name="name"
        :checked="(option.value === undefined ? option : option.value) === modelValue"
        :disabled="option.disabled"
        :value="option.value ?? option"
        @click="toggle(option)"
        @change="onChange(option)"
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

  &.collapse {
    align-items: flex-start;
    justify-content: flex-start;
  }

  &:has(input:checked) {
    background: color-mix(in lab, var(--ui-accent), transparent 70%);
    color: var(--ui-accent-deep);
    /* outline: 1px solid currentColor; */
  }
  &:hover:not(:has(input:disabled)) {
    background: color-mix(in lab, var(--ui-accent), transparent 70%);
    color: var(--ui-accent-deep);
  }
  &:has(input:focus-visible) {
    outline: 1px solid currentColor;
    outline-offset: -1px;
  }

  input {
    appearance: none;
  }
}
</style>
