<script setup>
import TheHeader from '@/components/TheHeader.vue'
import { useConfigStore } from '@/stores/config'
import { useDataStore } from '@/stores/data'
import { useSettingsStore } from '@/stores/settings'
const settingsStore = useSettingsStore()
const configStore = useConfigStore()
const dataStore = useDataStore()
</script>

<template>
  <div class="settings-view">
    <TheHeader />
    <main>
      <ul>
        <li>
          <span>language</span>
          <select v-model="settingsStore.lang">
            <option v-for="lang in configStore.languages" :key="lang">
              {{ lang }}
            </option>
          </select>
        </li>
        <li>
          <label for="edit-mode">edit mode</label>
          <input id="edit-mode" type="checkbox" v-model="settingsStore.edit" />
        </li>
        <li>
          <span>mode</span>
          <select v-model="settingsStore.mode">
            <option v-for="option in settingsStore.modeOptions" :key="option">
              {{ option }}
            </option>
          </select>
        </li>
        <li>
          <label for="pip">picture in picture</label>
          <input id="pip" type="checkbox" v-model="settingsStore.pictureInPicture" />
        </li>
      </ul>
      <ul>
        <li>
          <!-- <label for="export">export</label> -->
          <button @click="dataStore.exportProject">export data</button>
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
    [header-start] var(--spacing-double)
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
      border-radius: var(--spacing-half);
      li {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-half);
        justify-content: space-between;
        padding: var(--spacing-half);

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
