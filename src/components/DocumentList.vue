<script setup>
// import { useTerminusStore } from "@/stores/terminus";
// import { watch } from "vue";
import { RouterLink } from 'vue-router'
import DocumentCard from './DocumentCard.vue'

import IconEdit from '~icons/default/Edit'
import IconCompose from '~icons/default/Compose'

defineProps({ documents: Array, singleColumn: Boolean })
</script>

<template>
  <section class="document-list" :class="{ 'single-column': singleColumn }">
    <RouterLink
      :to="`/${document['@id']}`"
      v-for="document in documents"
      :key="document['@id']"
      class="button"
    >
      <DocumentCard :document="document" draggable="native" show-hover>
        <template v-slot:right>
          <RouterLink v-if="document['@type'] === 'graph'" :to="`/compose/${document['@id']}`">
            <IconCompose />
          </RouterLink>
          <RouterLink :to="`/edit/${document['@id']}`">
            <IconEdit />
          </RouterLink>
        </template>
      </DocumentCard>
    </RouterLink>
  </section>
</template>

<style lang="scss" scoped>
.document-list {
  display: flex;
  gap: var(--spacing);
  flex-wrap: wrap;

  &.single-column {
    flex-direction: column;
  }
}
</style>
