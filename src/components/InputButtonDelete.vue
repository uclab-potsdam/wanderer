<script setup>
import InputButton from '@/components/InputButton.vue'
import { ref } from 'vue'
import IconDelete from '~icons/base/Delete'
import IconDeleteConfirm from '~icons/base/DeleteConfirm'

const emit = defineEmits(['confirmed'])
const activated = ref(false)

function onClick() {
  console.log(activated.value)
  if (!activated.value) {
    activated.value = true
  } else {
    emit('confirmed')
    activated.value = false
  }
}
</script>
<template>
  <InputButton
    disable-padding
    @click="onClick"
    :class="{ activated }"
    @mouseout="activated = false"
  >
    <IconDelete v-if="!activated" />
    <IconDeleteConfirm v-else />
  </InputButton>
</template>
<style scoped>
.activated {
  color: color-mix(in lab, var(--red), var(--color-text) 40%) !important;
  --ui-accent: var(--red);

  * {
    pointer-events: none;
  }
}
</style>
