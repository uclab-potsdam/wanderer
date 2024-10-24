<script setup>
import { computed, ref } from 'vue'
import { useHelperStore } from '@/stores/helper'

const props = defineProps({
  node: Object
})

const helperStore = useHelperStore()

const el = ref(null)

const url = computed(() => helperStore.getMediaUrl(props.node.file))

defineExpose({
  el
})
</script>

<template>
  <div class="image">
    <img ref="el" :srcset="`${url} 2x`" draggable="false" />
  </div>
</template>

<style scoped>
.image {
  pointer-events: none;

  &.edit {
    pointer-events: initial;
    &:hover {
      border-radius: var(--spacing-quart);
      overflow: hidden;
    }
  }
  z-index: -2;

  /* background: var(--graph-accent); */

  img {
    /* background: var(--color-background); */
    /* mix-blend-mode: hard-light; */
    filter: grayscale(1);
    display: block;
    transform: scale(1.005);
  }

  .highlight {
    background: transparent;
    img {
      mix-blend-mode: none;
    }
  }
}
</style>
