<script setup>
import ListWrapper from './ListWrapper.vue'

defineProps(['context'])
</script>

<template>
  <!-- <div class="context-menu-list"> -->
  <ListWrapper class="context-menu-list">
    <button v-for="(option, i) in context" :key="i" @click="option.action">
      {{ option.label }}
    </button>
  </ListWrapper>
  <!-- </div> -->
</template>

<style scoped>
.context-menu-list {
  /* display: flex; */
  /* flex-direction: column; */
  /* background: var(--color-background); */
  /* box-shadow: var(--ui-shadow); */
  /* border-radius: var(--border-radius); */
  /* padding: var(--border-radius-half); */

  font-size: var(--font-size-small);
  min-width: 150px;

  button {
    text-align: left;
    padding: var(--spacing-half);
  }
}
</style>
