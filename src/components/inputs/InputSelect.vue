<script setup>
import { idgen } from '@/assets/js/utils'
import { ref, watchEffect } from 'vue'
import ModalSearch from '@/components/modals/ModalSearch.vue'
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'
import BaseButton from '../BaseButton.vue'
import IconDelete from '~icons/base/Delete'

const props = defineProps([
  'modelValue',
  'options',
  'label',
  'secondaryLabel',
  'placeholder',
  'type'
])
const emit = defineEmits(['update:modelValue'])

const terminusStore = useTerminusStore()
const viewStore = useViewStore()

const name = idgen()

const showModalSearch = ref(false)

function select(id) {
  showModalSearch.value = false
  emit('update:modelValue', id)
}

const modelLabel = ref({})

watchEffect(async () => {
  if (props.modelValue) {
    modelLabel.value = viewStore.localize(await terminusStore.getLabel(props.modelValue))
  } else {
    modelLabel.value = {}
  }
})
</script>
<template>
  <button class="input-text" @click="showModalSearch = true">
    <label :for="name">
      <span> {{ label }} </span>
      <span> {{ secondaryLabel }} </span>
    </label>
    <div class="input-field">
      <slot></slot>
      <span :lang="modelLabel.lang">{{ modelLabel.text || '&nbsp;' }}</span>
      <BaseButton tiny control v-if="modelValue" @click.stop="emit('update:modelValue', null)">
        <IconDelete />
      </BaseButton>
    </div>
  </button>
  <ModalSearch
    :show="showModalSearch"
    :default-type="type"
    disable-type-switching
    new-item
    @close="showModalSearch = false"
    @select="(e) => select(e, type)"
  />
</template>

<style lang="scss" scoped>
button {
  cursor: pointer;
  font: inherit;
  border: none;
  background: var(--ui-backdrop);
  border-radius: var(--ui-border-radius);
  display: grid;
  padding: var(--spacing-s);

  label {
    font-size: var(--font-size-s);
    color: var(--ui-text-muted);
    display: flex;
    justify-content: space-between;
  }

  .input-field {
    display: flex;
    align-items: center;
    gap: var(--spacing-s);
    font-size: var(--font-size);
    padding-top: var(--spacing-xs);
    width: var(--input-width);
    box-sizing: content-box;
    text-align: left;
    display: flex;
    justify-content: space-between;

    span {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  &:focus-within,
  &:focus-within label {
    color: var(--ui-accent-dark);
  }
}
</style>
