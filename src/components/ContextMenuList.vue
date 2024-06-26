<script setup>
defineProps(['context'])
</script>

<template>
  <div class="context-menu-list">
    <button v-for="(option, i) in context" :key="i" @click="option.action">
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.context-menu-list {
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  box-shadow: 0px 0px 5px color-mix(in lab, var(--color-text), transparent 80%);
  border-radius: var(--border-radius);
  padding: calc(var(--spacing) / 8);

  font-size: var(--font-size-small);
  min-width: 150px;

  button {
    text-align: left;
    padding: calc(var(--spacing) / 2);
  }
}
</style>
