<script setup>
import InputButton from './InputButton.vue'
import IconClose from '~icons/default/Close'

defineEmits(['close'])
</script>
<template>
  <section class="modal">
    <InputButton @click="$emit('close')"><IconClose /></InputButton>

    <div class="inner" @click="$event.stopPropagation()">
      <slot>Modal</slot>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.modal {
  position: absolute;
  top: var(--menu-bar-height);
  right: var(--spacing);
  min-width: 270px;

  max-height: calc(100vh - var(--menu-bar-height) - var(--spacing));
  overflow: auto;

  background: var(--tint);
  .inner {
    margin: 0 var(--spacing) var(--spacing) var(--spacing);
  }
}
</style>
