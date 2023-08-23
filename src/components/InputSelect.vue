<script setup>
defineProps({
  modelValue: [String, Boolean, Number],
  options: Array,
  label: String,
  secondaryLabel: String,
  allowNull: Boolean
})
defineEmits(['update:modelValue'])

const name = `n${(Math.random() + 1).toString(36).substring(2)}`
</script>
<template>
  <div class="input-text">
    <label :for="name" v-if="label || secondaryLabel">
      <span> {{ label }} </span>
      <span> {{ secondaryLabel }} </span>
    </label>
    <select
      :name="name"
      :value="modelValue"
      @change="
        $emit('update:modelValue', $event.target.value === 'null' ? null : $event.target.value)
      "
    >
      <option v-if="allowNull" value="null">–</option>
      <option
        v-for="(option, i) in options"
        :key="option.value ?? option"
        :value="option.value ?? option"
        :lang="option.label?.lang"
      >
        {{ option.label?.text ?? option.label ?? option ?? i }}
      </option>
    </select>
  </div>
</template>

<style lang="scss" scoped>
.input-text {
  display: inline-flex;
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
      color: var(--ui-accent-dark);
    }
  }

  &:focus-within label {
    color: var(--ui-accent-dark);
  }
}
</style>
