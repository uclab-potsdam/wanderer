<script setup>
// import { useTerminusStore } from "@/stores/terminus";
// import { watch } from "vue";
import { RouterLink } from "vue-router";
import DocumentCard from "./DocumentCard.vue";

import IconEdit from "~icons/default/Edit";

defineProps(["documents"]);
</script>

<template>
  <section class="document-list">
    <RouterLink
      :to="document['@id']"
      v-for="document in documents"
      :key="document['@id']"
      class="button"
    >
      <DocumentCard :document="document" draggable="native">
        <template v-slot:right>
          <RouterLink :to="`edit/${document['@id']}`">
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
}
</style>
