<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import DocumentCard from './DocumentCard.vue'

const route = useRoute()

const props = defineProps({
  allocation: Object
})

const x = computed(() => props.allocation.x)
const y = computed(() => props.allocation.y)

const id = computed(() => props.allocation.node['@id'].replace(/[^/]+\//, ''))
</script>

<template>
  <foreignObject width="100" height="100" :x="x" :y="y">
    <RouterLink
      v-if="allocation.node['@type'] === 'graph'"
      :to="{ name: route.name, params: { id } }"
      class="button"
    >
      <DocumentCard :document="allocation.node" />
    </RouterLink>
    <DocumentCard v-else :document="allocation.node" />
  </foreignObject>
</template>

<style lang="scss" scoped>
foreignObject > section.document,
foreignObject > a > section.document {
  transform: translate(-50%, -50%);
  outline: 3px solid var(--secondary);
}
</style>
