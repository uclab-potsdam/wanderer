<script setup>
import DocumentList from '../components/DocumentList.vue'
import InputSegment from '@/components/inputs/InputSegment.vue'

import { ref, watch, watchEffect, computed } from 'vue'
import { useTerminusStore } from '@/stores/terminus'
import { useRoute, useRouter } from 'vue-router'
import debounce from 'lodash.debounce'
import InputText from '@/components/inputs/InputText.vue'
import IconSearch from '~icons/base/Search'
import IconCreate from '~icons/base/Create'
import ModalCreate from './modals/ModalCreate.vue'

const terminusStore = useTerminusStore()
const route = useRoute()
const router = useRouter()

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Search'
  },
  updateRoute: {
    type: Boolean
  },
  newItem: {
    type: Boolean
  },
  defaultType: {
    type: String,
    default: 'entity'
  },
  disableTypeSwitching: Boolean,
  routing: Boolean
})

defineEmits(['close', 'select'])

const searchTerm = ref('')

const documents = ref([])
const results = ref(null)

const type = ref(props.updateRoute ? route.params.type : props.defaultType)
watch(() => type.value, search)
watch(searchTerm, debounce(search, 300))

watch(
  () => route.params.type,
  () => {
    if (props.updateRoute) {
      type.value = route.params.type
    }
  }
)

async function search() {
  if (searchTerm.value === '') {
    // emit('updateResults', null)
    results.value = null
    return
  }
  results.value = await terminusStore.search(searchTerm.value, type.value)
}

watchEffect(async () => {
  documents.value = await terminusStore.getDocumentsByType(type.value)
})

async function update() {
  documents.value = await terminusStore.getDocumentsByType(type.value)
}

const navOptions = [
  { label: 'Graphs', value: 'graph' },
  { label: 'Entities', value: 'entity' },
  { label: 'Media', value: 'media' },
  { label: 'Classes', value: 'class' },
  { label: 'Properties', value: 'property' }
]
const items = computed(() => results.value ?? documents.value)

function setRoute() {
  if (props.updateRoute) router.replace({ name: 'list', params: { type: type.value } })
}

const showModalCreate = ref(false)
</script>

<template>
  <div class="the-search">
    <InputText class="search" :placeholder="placeholder" v-model="searchTerm">
      <IconSearch />
    </InputText>
    <InputSegment
      v-if="!disableTypeSwitching"
      class="nav-options"
      :options="navOptions"
      v-model="type"
      @change="setRoute"
    />
    <DocumentList
      class="results"
      :documents="items"
      @close="$emit('close')"
      @update="update"
      @select="(id) => $emit('select', id)"
      :routing="routing"
    >
      <div v-if="newItem" class="new-item" @click="showModalCreate = true">
        <IconCreate />
        New {{ type }}
        <Teleport to="#modals">
          <ModalCreate
            :show="showModalCreate"
            :type="type"
            @close="showModalCreate = false"
            @update="update"
          ></ModalCreate>
        </Teleport>
      </div>
    </DocumentList>
  </div>
</template>

<style lang="scss" scoped>
.the-search {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-s);
  .search {
    // font-size: var(--font-size-l);
    // font-weight: var(--light);
    width: 770px;
    max-width: 100%;
  }

  .nav-options {
    font-size: var(--font-size-s);
    align-self: start;
  }

  .results {
    margin-top: var(--spacing);

    .new-item {
      display: flex;
      // justify-content: center;
      // align-items: center;
      padding: var(--spacing-l);
      outline: 1px dashed;
      outline-offset: -1px;
      border-radius: var(--border-radius);
      cursor: pointer;
      &:hover {
        color: var(--ui-accent-dark);
      }
    }
  }
}
</style>
