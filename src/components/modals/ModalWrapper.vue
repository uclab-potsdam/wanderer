<script setup>
import BaseButton from '@/components/BaseButton.vue'
import { useViewStore } from '@/stores/view'
import IconClose from '~icons/base/Close'

const viewStore = useViewStore()

defineProps({
  show: Boolean,
  showHeader: Boolean,
  title: String
})
defineEmits(['close'])
</script>
<template>
  <Transition name="modal">
    <section v-if="show" class="backdrop" @click="$emit('close')">
      <div class="modal" @click="$event.stopPropagation()">
        <header v-if="showHeader">
          <h1>{{ title }}</h1>
          <BaseButton @click="$emit('close')"><IconClose /></BaseButton>
        </header>
        <main>
          <slot>Modal</slot>
        </main>
      </div>
    </section>
  </Transition>
</template>

<style lang="scss" scoped>
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 200;

  background: var(--ui-backdrop-translucent);
  backdrop-filter: blur(7px);

  display: flex;
  justify-content: center;
  align-items: center;
  .modal {
    // padding: var(--spacing-s);
    background: var(--ui-background);
    border-radius: var(--ui-border-radius-l);
    min-width: 200px;
    max-height: calc(100vh - var(--spacing-xl) * 3);
    overflow: auto;

    header {
      display: flex;
      gap: var(--spacing);
      align-items: center;
      justify-content: space-between;
      padding: 0 0 0 var(--spacing);
    }

    main {
      padding: var(--spacing);
    }
  }

  &.modal-enter-active,
  &.modal-leave-active {
    transition: opacity var(--ui-transition) ease;
  }

  &.modal-enter-from,
  &.modal-leave-to {
    opacity: 0;
  }
}
</style>
