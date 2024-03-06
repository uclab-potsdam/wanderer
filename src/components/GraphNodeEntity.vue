<script setup>
import { computed, ref } from 'vue'
import { useHelperStore } from '@/stores/helper'

const props = defineProps({
  node: Object
})

const helperStore = useHelperStore()

const textElement = ref(null)

const text = computed(() => helperStore.localize(props.node.text))
const className = computed(() => helperStore.localize(props.node.class))
</script>

<template>
  <div class="entity">
    <span class="text measure-width" ref="textElement">{{ text }}</span>
    <span class="class measure-width" v-if="className != null"><br />{{ className }}</span>
  </div>
</template>

<style scoped>
.entity {
  max-width: 250px;
  padding: calc(var(--spacing) * 0.5);
  width: max-content;
  .text {
    font-weight: 900;
  }
}
</style>
