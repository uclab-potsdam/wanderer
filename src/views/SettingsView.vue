<script setup>
import TheHeader from '@/components/TheHeader.vue'
import { useConstantStore } from '@/stores/constant'
import { useSettingsStore } from '@/stores/settings'
const settingsStore = useSettingsStore()
const constantStore = useConstantStore()
</script>

<template>
  <div class="settings-view">
    <TheHeader />
    <main>
      <ul>
        <li>
          <span>language</span>
          <select v-model="settingsStore.lang">
            <option v-for="lang in constantStore.languages" :key="lang">
              {{ lang }}
            </option>
          </select>
        </li>
        <li>
          <label for="edit-mode">edit mode</label>
          <input id="edit-mode" type="checkbox" v-model="settingsStore.edit" />
        </li>
        <li>
          <label for="pip">picture in picture</label>
          <input id="pip" type="checkbox" v-model="settingsStore.pictureInPicture" />
        </li>
      </ul>
      <ul>
        <li>
          <label for="remote">remote</label>
          <input id="remote" type="checkbox" v-model="settingsStore.remote" />
        </li>
        <li>
          <label for="server">server</label>
          <input id="server" :disabled="!settingsStore.remote" v-model="settingsStore.server" />
        </li>
        <li>
          <label for="server">database id</label>
          <input id="server" :disabled="!settingsStore.remote" v-model="settingsStore.db" />
        </li>
        <li>
          <button :disabled="!settingsStore.remote">new</button>
          <button :disabled="!settingsStore.remote">duplicate</button>
        </li>
      </ul>
    </main>
  </div>
</template>

<style scoped>
.settings-view {
  display: grid;
  grid-template-columns:
    [header-start] 1fr
    [main-start] min(100vw - var(--spacing) * 2, 800px)
    [main-end] 1fr
    [header-end];

  grid-template-rows:
    [header-start] calc(var(--spacing) * 2)
    [header-end main-start]
    1fr
    [main-end];
  gap: var(--spacing);

  main {
    grid-column: main-start / main-end;
    grid-row: main-start / main-end;
    ul {
      list-style: none;
      padding: 0;
      border: 1px solid var(--color-text);
      border-radius: calc(var(--spacing) / 2);
      li {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: calc(var(--spacing) / 2);
        justify-content: space-between;
        padding: calc(var(--spacing) / 2);

        &:not(:last-child) {
          border-bottom: 1px solid color-mix(in lab, var(--color-text), transparent 75%);
        }
      }

      + ul {
        margin-top: var(--spacing);
      }
    }
  }
}
</style>
