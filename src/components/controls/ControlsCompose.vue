<script setup>
import { ref } from 'vue'
import IconCreate from '~icons/base/Create'
import IconSearch from '~icons/base/Search'
import BaseButtonGroup from '../BaseButtonGroup.vue'
import BaseButton from '../BaseButton.vue'
import ControlsMedia from './ControlsMedia.vue'

import ModalSearch from '@/components/modals/ModalSearch.vue'
import ModalCreate from '@/components/modals/ModalCreate.vue'

const showModalSearch = ref(false)
const showModalCreate = ref(false)
</script>
<template>
  <div class="compose">
    <BaseButtonGroup>
      <BaseButton small control @click="showModalSearch = true"><IconSearch /></BaseButton>
      <BaseButton small control @click="showModalCreate = true"><IconCreate /></BaseButton>
    </BaseButtonGroup>
    <Teleport to="#modals">
      <ModalSearch
        :show="showModalSearch"
        type="entity"
        @close="showModalSearch = false"
        new-item
      ></ModalSearch>
    </Teleport>
    <Teleport to="#modals">
      <ModalCreate
        :show="showModalCreate"
        type="entity"
        @close="showModalCreate = false"
      ></ModalCreate>
    </Teleport>
    <ControlsMedia persistent />
  </div>
</template>
<style lang="scss" scoped>
.compose {
  // grid-area: content;
  // display: flex;
  display: grid;
  grid-template-columns: auto 1fr;
  width: 100%;
  gap: calc(var(--spacing-s) + var(--spacing-xs));
}
</style>
