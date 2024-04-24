<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useHelperStore } from '@/stores/helper'
import { getContentWidth } from '@/assets/js/utils'

const props = defineProps({
  node: Object
})

const helperStore = useHelperStore()

const el = ref(null)

const width = ref(null)

const text = computed(() => helperStore.localize(props.node.text))
const className = computed(() => helperStore.localize(props.node.class))

onMounted(() => {
  width.value = getContentWidth(el)
})

defineExpose({
  el
})
</script>

<template>
  <div class="entity" ref="el" :style="{ width }">
    <span class="text">{{ text }}</span>
    <br v-if="className != null" />
    <span class="class" v-if="className != null">{{ className }}</span>
  </div>
</template>

<style scoped>
.entity {
  box-sizing: content-box;
  max-width: 200px;
  width: max-content;
  padding: calc(var(--spacing) * 0.5);
  --tinted: color-mix(in lab, var(--graph-accent), var(--color-text) 60%);
  color: color-mix(in lab, var(--tinted), var(--color-background) 10%);

  &.hide {
    opacity: 0.2;
    filter: blur(10px);

    &.user-active {
      filter: none;
      opacity: 1;
      color: color-mix(in lab, var(--tinted), var(--color-background) 50%);
    }
  }

  &.highlight {
    color: color-mix(in lab, var(--graph-accent), var(--color-text) 30%);

    span {
      --highlight-color: color-mix(in lab, var(--graph-accent), transparent 60%);
      padding: 0.1em 10px;
      margin: -0.1em -10px;
      border-radius: 10px 2.5px 7.5px 5.5px;
      box-decoration-break: clone;

      background: linear-gradient(
          100deg,
          color-mix(in lab, var(--highlight-color), transparent 99%) 5%,
          color-mix(in lab, var(--highlight-color), transparent 0%) 6.2%,
          color-mix(in lab, var(--highlight-color), transparent 50%) 7.8%,
          color-mix(in lab, var(--highlight-color), transparent 80%) 93%,
          color-mix(in lab, var(--highlight-color), transparent 40%) 96%,
          color-mix(in lab, var(--highlight-color), transparent 99%) 97%
        ),
        linear-gradient(
          195deg,
          color-mix(in lab, var(--highlight-color), transparent 99%) 0%,
          color-mix(in lab, var(--highlight-color), transparent 70%) 7.9%,
          color-mix(in lab, var(--highlight-color), transparent 99%) 50%
        );
    }
  }

  &.network {
    color: var(--color-text);
  }

  .text {
    font-weight: 900;
  }

  .inner {
    display: inline;
  }
}
</style>
