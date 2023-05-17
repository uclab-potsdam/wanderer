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
  top: 45px;
  right: var(--spacing);
  // width: 270px;
  // left: 0;
  // bottom: 0;
  // right: 0;
  // background: red;
  // padding: var(--spacing);
  // border: 1.5px solid var(--primary);
  // border-radius: var(--spacing-s);
  // box-shadow: var(--spacing-xs) var(--spacing-xs) var(--spacing-xs) var(--spacing-xs) var(--shadow);
  // --shadow: rgba(var(--gray-0), 0.5);

  max-height: calc(100vh - 45px - var(--spacing));
  overflow: auto;

  background: var(--tint);

  // display: flex;

  // justify-content: center;
  // align-items: center;
  // background: rgba(var(--gray-11), 0.5);

  .inner {
    margin: 0 var(--spacing) var(--spacing) var(--spacing);
  }
}
</style>
