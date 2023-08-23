<script setup>
// import { useTerminusStore } from "@/stores/terminus";
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import DocumentCard from './DocumentCard.vue'

import IconEdit from '~icons/default/Edit'
import ModalEdit from './modals/ModalEdit.vue'

defineProps({ documents: Array, routing: Boolean })
defineEmits(['close', 'update', 'select'])

const showEditModal = ref(null)
</script>

<template>
  <section class="document-list">
    <slot />
    <template v-for="document in documents" :key="document['@id']">
      <component :is="routing ? RouterLink : 'div'" :to="routing && `/${document['@id']}`">
        <!-- <RouterLink
     
      :key="document['@id']"
      class="button"
    > -->

        <DocumentCard
          :document="document"
          draggable="native"
          show-hover
          @close="$emit('close')"
          @click="$emit('select', document['@id'])"
        >
          <template v-slot:right>
            <IconEdit @click.stop.prevent="showEditModal = document['@id']" />
            <Teleport to="#modals">
              <ModalEdit
                :show="showEditModal === document['@id']"
                :id="document['@id']"
                :type="document['@type']"
                @close="showEditModal = null"
                @update="$emit('update')"
              />
            </Teleport>
          </template>
        </DocumentCard>
      </component>
    </template>
    <!-- </RouterLink> -->
  </section>
</template>

<style lang="scss" scoped>
.document-list {
  display: grid;
  // grid-auto-flow: column;
  grid-template-columns: repeat(auto-fit, 250px);
  // grid-auto-columns: 1fr;
  gap: var(--spacing);
  // flex-wrap: wrap;
}
</style>
