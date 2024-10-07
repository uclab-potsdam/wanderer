<script setup>
import { computed, onMounted, ref } from 'vue'
import { useDataStore } from '@/stores/data'
import { getContentWidth } from '@/assets/js/utils'
import LocalizeText from './LocalizeText.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const props = defineProps({
  node: Object,
  id: String
})

const dataStore = useDataStore()

const el = ref(null)

const width = ref(null)

const nodeClass = computed(() => dataStore.data.nodes[props.node.class]?.label)

const detail = computed(() => route.params.id === props.id)

onMounted(() => {
  width.value = !detail.value && getContentWidth(el)
})

defineExpose({
  el
})
</script>

<template>
  <div class="entity" ref="el" :style="{ width }" :class="{ detail }">
    <span class="text"><LocalizeText :text="node.label" /></span>
    <br v-if="nodeClass" />
    <span class="class" v-if="nodeClass"><LocalizeText :text="nodeClass" /></span>
  </div>
</template>

<style scoped>
.entity {
  font-size: var(--font-size-small);
  box-sizing: content-box;
  max-width: 200px;
  width: max-content;
  padding: var(--spacing-half);
  --tinted: color-mix(in lab, var(--graph-accent), var(--color-text) 60%);
  color: var(--color-text);

  text-align: center;

  &.hide {
    opacity: 0.2;
    filter: var(--blur);

    &.user-active {
      filter: none;
      opacity: 1;
      color: color-mix(in lab, var(--color-text), var(--color-background) 70%);
    }
  }

  &.highlight {
    color: var(--graph-accent);

    span {
      --highlight-color: color-mix(in lab, var(--graph-accent), transparent 80%);
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
    /* font-weight: 900; */
    font: var(--serif);
    font-weight: bold;
  }

  .class {
    font-size: var(--font-size-small);
  }

  .inner {
    display: inline;
  }

  &.detail {
    width: 300px;
    background-color: var(--graph-accent);
    text-align: left;
  }
}
</style>
