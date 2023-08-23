<script setup>
import { ref, computed } from 'vue'
import InputText from '@/components/inputs/InputText.vue'

const props = defineProps(['modelValue', 'options', 'label'])
const emit = defineEmits(['update:modelValue'])

const isArray = ref(Array.isArray(props.modelValue))

const keys = computed(() =>
  isArray.value
    ? new Array(props.modelValue.length + 1).fill().map((d, i) => i)
    : Object.keys(props.modelValue)
)

function updateValue(key, value) {
  if (isArray.value) {
    const proxy = [...props.modelValue]
    proxy.splice(+key, 1, value)
    emit(
      'update:modelValue',
      proxy.filter((v) => v)
    )
  } else {
    emit('update:modelValue', {
      ...props.modelValue,
      [key]: value
    })
  }
}
</script>

<template>
  <section class="input-text-multi">
    <InputText
      v-for="(key, i) in keys"
      :key="key"
      :label="i === 0 ? label : null"
      :secondary-label="isArray ? 1 + key : key"
      :model-value="modelValue[key]"
      @input="updateValue(key, $event.target.value)"
      v-bind="options"
    />
  </section>
</template>

<style lang="scss" scoped>
.input-text-multi {
  display: flex;
  gap: var(--spacing);
  flex-wrap: wrap;

  &:focus-within {
    :deep(.input-text:first-child > label > span:first-child) {
      color: var(--ui-accent-dark);
    }
  }
}
</style>
