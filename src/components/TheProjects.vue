<script setup>
import InputButton from '@/components/InputButton.vue'
import { useConstantStore } from '@/stores/constant'
import { useDataStore } from '@/stores/data'

// import { useRoute } from 'vue-router'

const dataStore = useDataStore()
const constantStore = useConstantStore()

// const route = useRoute()
</script>

<template>
  <main class="projects">
    <div class="toolbar">
      <InputButton primary @click="dataStore.addProject()">new</InputButton>
      <InputButton
        primary
        :disabled="constantStore.wandererServer == null"
        @click="dataStore.addProject(null, null, true)"
        >new remote</InputButton
      >
      <InputButton primary @click="dataStore.importFromStatic()">import</InputButton>
      <InputButton primary @click="dataStore.projectId = null">disconnect</InputButton>
    </div>
    <ul class="project-list">
      <RouterLink
        v-for="project in dataStore.projects"
        :key="project.id"
        :to="{ name: 'open', params: { id: project.id } }"
        :class="{ active: dataStore.projectId === project.id }"
      >
        <li>
          <code>{{ project.id.split('-')[0] }}</code>
          {{ project.opened.toLocaleString() }}
          <em>{{ project.remote ? 'remote' : 'local' }}</em>
          <InputButton @click.stop.prevent="dataStore.deleteProject(project.id)">
            delete
          </InputButton>
        </li>
      </RouterLink>
    </ul>
  </main>
</template>

<style scoped>
.projects {
  grid-column: main-start / main-end;
  grid-row: main-start / main-end;

  display: flex;
  flex-direction: column;
  gap: var(--spacing);

  .toolbar {
    display: flex;
    gap: var(--spacing-half);
  }

  .project-list {
    list-style: none;
    padding: 0;
    a {
      text-decoration: none;
      color: inherit;
      &.active {
        color: var(--ui-accent);
      }
      li {
        code {
          background-color: color-mix(in lab, currentColor, transparent 90%);
          padding: 0 var(--spacing-quart);
          border-radius: 5px;
        }
      }
    }
  }
}
</style>
