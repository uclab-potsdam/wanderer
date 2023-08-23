<script setup>
import { ref, computed } from 'vue'
import InputSelect from './InputSelect.vue'

const props = defineProps({
  modelValue: [String, Number, Boolean],
  options: Array,
  label: String,
  allowNull: Boolean
})
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
    <InputSelect
      v-for="(key, i) in keys"
      :key="key"
      :label="i === 0 ? label : null"
      :secondary-label="isArray ? 1 + key : key"
      :model-value="modelValue[key]"
      :allow-null="allowNull"
      @input="updateValue(key, $event.target.value)"
      :options="options"
    />
  </section>
</template>

<style lang="scss" scoped>
.input-text-multi {
  display: flex;
  gap: var(--spacing-l);
  flex-wrap: wrap;

  &:focus-within {
    :deep(.input-text:first-child > label > span:first-child) {
      color: var(--ui-accent-dark);
    }
  }
}
</style>
