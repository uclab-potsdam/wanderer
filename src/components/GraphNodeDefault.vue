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
    text() {
      return this.helperStore.localize(this.node.text)
    },
    ...mapStores(useHelperStore)
  }
}
// import { computed } from 'vue'

// const helperStore = useHelperStore()

// const text = computed(() => helperStore.localize(props.node.text))
// const el = ref(null)
</script>

<template>
  <div class="entity" ref="el">
    <span class="text measure-width">{{ text }}</span>
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
