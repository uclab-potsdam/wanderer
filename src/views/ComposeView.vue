<script setup>
// import TheHeader from '@/components/TheHeader.vue'
// import IconAdd from '~icons/default/Add'
// import InputButton from "@/components/InputButton.vue";
// import { RouterLink, useRoute, useRouter } from "vue-router";
// import { useTerminusStore } from "@/stores/terminus";
import { ref } from 'vue'
import DocumentList from '../components/DocumentList.vue'
import TheCanvas from '@/components/TheCanvas.vue'
// import BaseNav from "@/components/BaseNav.vue";
// import TheSearch from '@/components/TheSearch.vue'

// const route = useRoute();
// const terminusStore = useTerminusStore();
// const router = useRouter();

const documents = ref([])
// const documentsFromSearch = ref(null);

// watch(
//   () => route.meta.type,
//   async (type) => {
//     documentsFromType.value = await terminusStore.getDocumentsByType(type);
//   },
//   { immediate: true }
// );

// async function updateResults(res) {
//   documents.value = res
// }

// const documents = computed(
//   () => documentsFromSearch.value || documentsFromType.value
// );
</script>

<template>
  <!-- <TheHeader>
    <template v-slot:left
      ><TheSearch placeholder="Search Workbench" @update-results="updateResults" type="entity"
    /></template>
    <template v-slot:right>
      <RouterLink
        class="align-horizontal button"
        :to="{ name: 'create', params: { type: 'entity' } }"
      >
        <IconAdd />
        add entity
      </RouterLink>
    </template>
  </TheHeader> -->
  <TheCanvas />
  <main>
    <div class="search-results" v-if="documents != null">
      <DocumentList :documents="documents"></DocumentList>
    </div>
  </main>
</template>

<style lang="scss" scoped>
main {
  display: flex;

  .search-results {
    // width: 250px;
    justify-content: flex-start;
    // pointer-events: none;
    // width: 305px;
    margin: var(--spacing) var(--spacing) var(--spacing)
      calc(var(--spacing) * 2 + var(--icon-width));
    background: var(--secondary);
    position: relative;
    // flex-direction: column;
    gap: var(--spacing-xl);

    height: 100%;
  }
}
</style>
