<script setup>
import { useDataStore } from '@/stores/data'
import { useRoute } from 'vue-router'
import IconIndex from '~icons/base/Index'
import ListItem from './ListItem.vue'
import ListWrapper from './ListWrapper.vue'
import InputButton from './InputButton.vue'
import { useModalStore } from '@/stores/modal'
import { useSettingsStore } from '@/stores/settings'

import IconEdit from '~icons/base/Edit'
import IconNew from '~icons/base/New'
import InputButtonDelete from './InputButtonDelete.vue'
import { useHelperStore } from '@/stores/helper'

const dataStore = useDataStore()
const modalStore = useModalStore()
const settingsStore = useSettingsStore()
const helperStore = useHelperStore()

const route = useRoute()

function createNode() {
  const id = dataStore.createNode({ type: route.params.type })
  modalStore.open(id, 'node')
}
</script>

<template>
  <main class="list">
    <nav>
      <ListWrapper horizontal equal-size>
        <InputButton tag="RouterLink" to="graph"> Stories </InputButton>
        <InputButton tag="RouterLink" to="entity"> Entities </InputButton>
        <InputButton tag="RouterLink" to="image"> Images </InputButton>
      </ListWrapper>
      <ListWrapper horizontal>
        <InputButton
          :disabled="!settingsStore.edit"
          @click="createNode"
          disable-padding
          title="new"
        >
          <IconNew />
        </InputButton>
      </ListWrapper>
    </nav>

    <div class="node-list">
      <template v-for="(node, id) in dataStore.data.nodes" :key="id">
        <ListItem
          tag="RouterLink"
          :to="{ name: 'graph', params: { type: node.type, id } }"
          v-if="node.type === route.params.type"
          :label="node.label"
          :index="node.index"
          :image="node.type === 'image' ? helperStore.getMediaUrl(node.file) : null"
          :meta="dataStore.data.nodes[node.class]?.label"
        >
          <IconIndex v-if="node.index" style="color: var(--color-accent)" />
          <InputButtonDelete
            title="delete"
            @click.prevent
            @confirmed="dataStore.deleteNode(id, null, true)"
            :disabled="!settingsStore.edit"
          />
          <InputButton
            title="edit"
            @click.stop.prevent="modalStore.open(id, 'node')"
            disable-padding
            :disabled="!settingsStore.edit"
          >
            <IconEdit />
          </InputButton>
        </ListItem>
      </template>
    </div>
  </main>
</template>

<style scoped>
.list {
  grid-column: main-start / main-end;
  grid-row: main-start / main-end;

  nav {
    margin: var(--spacing) 0;
    display: flex;
    gap: var(--spacing);
    justify-content: space-between;
  }

  .node-list {
    display: flex;
    flex-direction: column-reverse;
  }
}
</style>
