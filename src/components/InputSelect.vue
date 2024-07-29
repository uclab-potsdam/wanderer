<script setup>
defineProps({
  modelValue: [String, Boolean, Number],
  options: Array,
  label: String,
  name: String
})
defineEmits(['update:modelValue'])
</script>
<template>
  <div class="input-segment">
    <label>
      {{ label }}
    </label>

    <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
      <option v-for="(option, i) in options" :key="i">
        {{ option.label ?? option.value ?? option }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.input-segment {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  text-align: center;
  align-self: center;

  background: color-mix(in lab, var(--accent), transparent 90%);
  backdrop-filter: var(--blur);
  border-radius: 5px;
  margin: 0 var(--spacing-quart);
  /* height: var(--spacing); */
  font-size: 14px;
  text-transform: uppercase;
  padding: var(--border-radius-small);
  gap: var(--border-radius-small);
  color: color-mix(in lab, var(--accent), var(--color-text) 30%);
  font-weight: bold;

  label {
    transition: all var(--ui-transition);
    padding: var(--spacing-quart);
    border-radius: 3px;
    outline: 1px solid transparent;
    outline-offset: -1px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    height: var(--spacing);

    &:hover {
      outline: 1px solid var(--accent);
      color: var(--accent);
    }
    &:has(input:checked) {
      background: color-mix(in lab, var(--accent), transparent 70%);
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
