<script setup>
defineEmits(["close"]);
</script>
<template>
  <section class="modal" @click="$emit('close')">
    <div class="inner" @click="$event.stopPropagation()">
      <slot>Modal</slot>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.modal {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(var(--gray-11), 0.5);

  .inner {
    border: 1px solid var(--primary);
    padding: var(--spacing-l);
    background: var(--secondary);
  }
}
</style>
