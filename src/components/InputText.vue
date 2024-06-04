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
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  text-align: center;
  align-self: center;
}
</style>
