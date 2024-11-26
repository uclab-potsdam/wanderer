<script setup>
import InputButton from '@/components/InputButton.vue'
import InputButtonDelete from '@/components/InputButtonDelete.vue'
import InputSegment from '@/components/InputSegment.vue'
import ListWrapper from '@/components/ListWrapper.vue'
import TheHeader from '@/components/TheHeader.vue'
import { useConfigStore } from '@/stores/config'
import { useDataStore } from '@/stores/data'
import { useSettingsStore } from '@/stores/settings'
import IconExport from '~icons/base/Export'
import IconImport from '~icons/base/Import'
const settingsStore = useSettingsStore()
const configStore = useConfigStore()
const dataStore = useDataStore()

async function importProject(e) {
  await dataStore.importProject(e.target.files[0])
  if (settingsStore.mode === 'public') settingsStore.mode = 'edit'

  e.target.value = null

  // console.log(e.target.files[0])
  // const promises = [...e.target.files].map((file) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader()
  //     reader.addEventListener('load', (event) => {
  //       try {
  //         const id = JSON.parse(event.target.result).id

  //         if (id == null) return reject()
  //         localStorage.setItem(`story-${id}`, event.target.result)
  //         resolve()
  //       } catch (error) {
  //         console.error(error)
  //         reject(error)
  //       }
  //     })
  //     reader.readAsText(file)
  //   })
  // })
}
</script>

<template>
  <div class="settings-view">
    <TheHeader />
    <main>
      <ul>
        <li>
          <span class="label">editing</span>
          <InputSegment
            horizontal
            equal-size
            v-model="settingsStore.enableEditing"
            :options="[
              { value: false, label: 'off' },
              { value: true, label: 'on' }
            ]"
          />
        </li>
        <li class="button-group">
          <ListWrapper class="extend" horizontal equal-size>
            <InputButton @click="dataStore.exportProject" title="export data"
              ><IconExport
            /></InputButton>
            <InputButton
              tag="label"
              title="import data"
              for="file-import"
              type="file"
              accept="application/json"
              ><IconImport
            /></InputButton>
            <InputButtonDelete
              @confirmed="dataStore.deleteLocalChanges"
              title="delete edits"
            ></InputButtonDelete>
          </ListWrapper>
        </li>
        <input id="file-import" type="file" accept="application/json" @change="importProject" />
      </ul>
    </main>
  </div>
</template>

<style scoped>
.settings-view {
  display: grid;
  grid-template-columns:
    [header-start] 1fr
    [main-start] min(100vw - var(--spacing) * 2, 400px)
    [main-end] 1fr
    [header-end];

  grid-template-rows:
    [header-start] 65px
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
      border-radius: var(--spacing-half);
      background: color-mix(in hsl, var(--ui-accent), transparent 96%);
      li {
        display: grid;
        grid-template-columns: 1fr 2fr;
        /* gap: var(--spacing-half); */
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-half);

        .label {
          font-size: var(--font-size-small);
        }
        .extend {
          grid-column: 1 / -1;

          .button {
            border-radius: var(--border-radius-small);
          }
        }

        &.button-group {
          grid-template-columns: 1fr 1fr 2fr;
        }
      }

      + ul {
        margin-top: var(--spacing);
      }
    }
  }

  #file-import {
    display: none;
  }
}
</style>
