<script setup>
import { useDataStore } from '@/stores/data'
import { useRoute } from 'vue-router'
import ListItem from './ListItem.vue'
import ListWrapper from './ListWrapper.vue'
import InputButton from './InputButton.vue'
import { useModalStore } from '@/stores/modal'
import { useSettingsStore } from '@/stores/settings'

import IconEdit from '~icons/base/Edit'
import IconNew from '~icons/base/New'
import InputButtonDelete from './InputButtonDelete.vue'

const dataStore = useDataStore()
const modalStore = useModalStore()
const settingsStore = useSettingsStore()

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
        <InputButton tag="RouterLink" to="projects" v-if="settingsStore.edit">
          Projects
        </InputButton>
        <InputButton tag="RouterLink" to="graph"> Stories </InputButton>
        <InputButton tag="RouterLink" to="entity"> Entities </InputButton>
        <InputButton tag="RouterLink" to="image"> Images </InputButton>
      </ListWrapper>
      <ListWrapper horizontal>
        <InputButton @click="createNode" disable-padding title="new"> <IconNew /> </InputButton>
      </ListWrapper>
    </nav>

    <div class="node-list">
      <template v-for="(node, id) in dataStore.data.nodes" :key="id">
        <ListItem
          tag="RouterLink"
          :to="{ name: 'graph', params: { type: node.type, id } }"
          v-if="node.type === route.params.type"
          :label="node.label"
          :meta="dataStore.data.nodes[node.class]?.label"
        >
          <InputButtonDelete
            title="delete"
            @click.prevent
            @confirmed="dataStore.deleteNode(id, null, true)"
          />
          <InputButton
            title="edit"
            @click.stop.prevent="modalStore.open(id, 'node')"
            disable-padding
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
