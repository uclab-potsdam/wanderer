<script setup>
import ModalWrapper from '@/components/modals/ModalWrapper.vue'
import ModalSettingsAccount from '@/components/modals/ModalSettingsAccount.vue'
import InputSegment from '@/components/inputs/InputSegment.vue'

import { useViewStore } from '@/stores/view'

const viewStore = useViewStore()
</script>

<template>
  <ModalWrapper show-header title="Settings">
    <div class="settings">
      <section>
        <div class="label">Language</div>
        <InputSegment v-model="viewStore.language" :options="viewStore.languageOptions"></InputSegment>
      </section>
      <section>
        <div class="label">Theme</div>
        <InputSegment v-model="viewStore.theme" :options="['Auto', 'Light', 'Dark']"></InputSegment>
      </section>

      <ModalSettingsAccount> </ModalSettingsAccount>
    </div>
  </ModalWrapper>
</template>

<style lang="scss" scoped>
.settings {
  font-size: var(--font-size-s);
  width: 300px;
  display: grid;
  gap: var(--spacing-l);
  > section {
    display: grid;
    gap: var(--spacing-s);
  }
}
</style>
