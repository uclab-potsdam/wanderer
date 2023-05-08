<script setup>
defineProps(["modelValue", "options", "label", "secondaryLabel"]);
defineEmits(["update:modelValue"]);

const name = `n${(Math.random() + 1).toString(36).substring(2)}`;
</script>
<template>
  <div class="input-text">
    <label :for="name">
      <span> {{ label }} </span>
      <span> {{ secondaryLabel }} </span>
    </label>
    <input
      :name="name"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      v-bind="options"
    />
  </div>
</template>

<style lang="scss" scoped>
.input-text {
  display: flex;
  flex-direction: column;
  width: var(--input-width);
  // align-items: flex-start;

  label {
    font-size: var(--font-size-s);
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
  }

  input {
    all: unset;
    border-bottom: 1px solid currentColor;
    padding: var(--spacing-s) 0;

    &:focus {
      color: var(--accent);
    }
  }

  &:focus-within label {
    color: var(--accent);
  }
}
</style>
