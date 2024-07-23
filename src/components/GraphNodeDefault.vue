<script>
import { useHelperStore } from '@/stores/helper'
import { mapStores } from 'pinia'
export default {
  data() {
    return {
      count: 0
    }
  },
  props: { node: Object },
  computed: {
    label() {
      return this.helperStore.localize(this.node.label ?? this.node.text)
    },
    ...mapStores(useHelperStore)
  }
}
</script>

<template>
  <div class="entity" ref="el">
    <span class="text measure-width">{{ label }}</span>
  </div>
</template>

<style scoped>
.entity {
  color: var(--graph-accent);
  max-width: 250px;
  padding: var(--spacing-half);
  width: max-content;
}
</style>
