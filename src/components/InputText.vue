<script setup>
defineProps({
  modelValue: String,
  label: String,
  name: String
})
defineEmits(['update:modelValue'])
</script>
<template>
  <div class="input-text">
    <label>
      {{ label }}
      <input
        type="text"
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
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
