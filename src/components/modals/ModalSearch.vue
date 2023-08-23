<script setup>
import TheSearch from '@/components/TheSearch.vue'
import ModalWrapper from '@/components/modals/ModalWrapper.vue'
defineEmits(['close', 'select'])
defineProps({
  defaultType: {
    type: String,
    default: 'entity'
  },
  newItem: Boolean,
  disableTypeSwitching: Boolean
})
</script>

<template>
  <ModalWrapper @close="$emit('close')">
    <TheSearch
      class="search"
      @close="$emit('close')"
      @select="(e) => $emit('select', e)"
      :disable-type-switching="disableTypeSwitching"
      :default-type="defaultType"
      :new-item="newItem"
    />
  </ModalWrapper>
</template>

<style lang="scss" scoped>
.search {
  // align-self: center;
  // margin-top: var(--spacing-xl);
  // margin-left: 56px;
  // width: 770px;
  // max-width: 100%;
  // padding: var(--spacing);
  // display: flex;
  // flex-direction: column;
  // gap: var(--spacing-s);
  height: min(calc(100vh - var(--spacing-xl) * 3), 550px);
}
</style>
