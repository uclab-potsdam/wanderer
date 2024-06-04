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
  backdrop-filter: blur(7px);
  border-radius: 5px;
  margin: 0 calc(var(--spacing) / 4);
  /* height: var(--spacing); */
  font-size: 14px;
  text-transform: uppercase;
  padding: calc(var(--spacing) / 8);
  gap: calc(var(--spacing) / 8);
  color: color-mix(in lab, var(--accent), var(--color-text) 30%);
  font-weight: bold;

  label {
    transition: all var(--ui-transition);
    padding: calc(var(--spacing) / 4);
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
