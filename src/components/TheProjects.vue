<script setup>
import InputButton from '@/components/InputButton.vue'
import ListWrapper from './ListWrapper.vue'
import ListItem from './ListItem.vue'
import { useConstantStore } from '@/stores/constant'
import { useDataStore } from '@/stores/data'
import { useSettingsStore } from '@/stores/settings'

import IconDelete from '~icons/base/Delete'
import IconShare from '~icons/base/Share'
import IconDuplicate from '~icons/base/Duplicate'
import IconExport from '~icons/base/Export'
import IconImport from '~icons/base/Import'
import IconNew from '~icons/base/New'

// import { useRoute } from 'vue-router'

const dataStore = useDataStore()
const constantStore = useConstantStore()
const settingsStore = useSettingsStore()

// const route = useRoute()
function importFile(e) {
  const file = e.target.files[0]
  const reader = new FileReader()
  reader.addEventListener('load', (event) => {
    dataStore.addProject(null, JSON.parse(event.target.result))
  })
  reader.readAsText(file)
}
</script>

<template>
  <main class="projects">
    <nav>
      <ListWrapper horizontal equal-size>
        <InputButton tag="RouterLink" to="projects"> Projects </InputButton>
        <InputButton tag="RouterLink" to="graph"> Stories </InputButton>
        <InputButton tag="RouterLink" to="entity"> Entities </InputButton>
        <InputButton tag="RouterLink" to="image"> Images </InputButton>
      </ListWrapper>
      <div class="right">
        <ListWrapper horizontal>
          <InputButton
            tag="label"
            for="file-import"
            type="file"
            accept="application/json"
            disable-padding
          >
            <IconImport />
          </InputButton>
          <input id="file-import" type="file" accept="application/json" @change="importFile" />
        </ListWrapper>
        <ListWrapper horizontal>
          <InputButton @click="dataStore.addProject()" disable-padding><IconNew /></InputButton>
        </ListWrapper>
      </div>
    </nav>

    <!-- <div class="toolbar">
      <InputButton primary @click="dataStore.addProject()">new</InputButton>
      <InputButton
        primary
        :disabled="constantStore.wandererServer == null"
        @click="dataStore.addProject(null, null, true)"
        >new remote</InputButton
      >
      <InputButton primary @click="dataStore.importFromStatic()">import</InputButton>
      <InputButton primary @click="dataStore.projectId = null">disconnect</InputButton>
    </div> -->
    <div class="project-list">
      <ListItem label="static" :meta="constantStore.wandererStatic">
        <InputButton @click.stop.prevent="dataStore.duplicateProject()" disable-padding>
          <IconDuplicate />
        </InputButton>
        <InputButton @click.stop.prevent="dataStore.exportProject()" disable-padding>
          <IconExport />
        </InputButton>
      </ListItem>
      <template v-for="project in dataStore.projects" :key="project.id">
        <ListItem
          tag="RouterLink"
          :to="{ name: 'open', params: { id: project.id } }"
          :class="{ active: dataStore.projectId === project.id }"
          :label="project.id.split('-')[0]"
          :meta="`${project.opened.toLocaleString()} – ${project.remote ? 'remote' : 'local'}`"
        >
          <InputButton @click.stop.prevent="dataStore.deleteProject(project.id)" disable-padding>
            <IconDelete />
          </InputButton>
          <template v-if="settingsStore.remote">
            <InputButton
              @click.stop.prevent="dataStore.copyProjectLink(project.id)"
              disable-padding
            >
              <IconShare />
            </InputButton>
          </template>
          <InputButton @click.stop.prevent="dataStore.duplicateProject(project.id)" disable-padding>
            <IconDuplicate />
          </InputButton>
          <InputButton @click.stop.prevent="dataStore.exportProject(project.id)" disable-padding>
            <IconExport />
          </InputButton>
        </ListItem>
      </template>
      <!-- <RouterLink
        
        :key="project.id"
        :to="{ name: 'open', params: { id: project.id } }"
        :class="{ active: dataStore.projectId === project.id }"
      >
        <li>
          <code>{{ project.id.split('-')[0] }}</code>
          {{ project.opened.toLocaleString() }}
          <em>{{ project.remote ? 'remote' : 'local' }}</em>
          
        </li>
      </RouterLink> -->
    </div>
  </main>
</template>

<style scoped>
.projects {
  grid-column: main-start / main-end;
  grid-row: main-start / main-end;

  nav {
    margin: var(--spacing) 0;
    display: flex;
    gap: var(--spacing);
    justify-content: space-between;

    .right {
      display: flex;
      gap: var(--spacing-quart);

      #file-import {
        display: none;
      }
    }
  }
}
</style>
