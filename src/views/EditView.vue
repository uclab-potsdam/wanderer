<script setup>
import TheHeader from '@/components/TheHeader.vue'
import InputButton from '@/components/InputButton.vue'
import { useRoute, useRouter } from 'vue-router'
import InputTextMulti from '../components/InputTextMulti.vue'
import InputText from '../components/InputText.vue'
import InputSelect from '../components/InputSelect.vue'
import InputSelectMulti from '../components/InputSelectMulti.vue'
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'
import { ref, computed } from 'vue'

const route = useRoute()
const router = useRouter()
const terminusStore = useTerminusStore()
const viewStore = useViewStore()

const frame = ref([])

const id = computed(
  // () => `${route.params.type}/${route.params.id}`
  () => location.pathname.replace(/^\/?edit\//, '')
)

const document = ref({})

async function getDocument() {
  document.value = await terminusStore.getDocument(id.value)

  const schema = terminusStore.schema[document.value['@type']]
  frame.value = await Promise.all(
    Object.keys(schema)
      .filter((key) => /^[^@]/.test(key))
      .map(async (key) => {
        const label = viewStore.localize(
          Object.fromEntries(
            [schema['@documentation']]
              .flat()
              .filter((d) => d != null)
              .map((d) => [d['@language'] || 'universal', d['@properties']?.[key]?.['@label']])
          )
        ) || { text: key }

        const isSet = schema[key]['@type'] === 'Set'
        const type = schema[key]['@class']?.['@class'] || schema[key]['@class'] || schema[key]

        const input = type === 'text' || /:/.test(type) ? 'text' : 'select'

        let value = document.value[key]
        if (type === 'text') {
          value = Object.fromEntries(
            terminusStore.languages.map((lang) => [lang, document.value[key]?.[lang] || null])
          )
        }

        if (isSet && value == null) {
          value = []
        }

        let options = []
        if (type !== 'text' && !/:/.test(type)) {
          options = (await terminusStore.getDocumentsByType(type)).map((doc) => ({
            value: doc['@id'],
            label: viewStore.localize(doc.label)
          }))
        }

        return {
          key,
          label,
          isSet,
          input,
          type,
          value,
          options
        }
      })
  )

  // label.value = {
  //   en: document.value.label.en || null,
  //   de: document.value.label.de || null,
  //   pt: document.value.label.pt || null,
  //   universal: document.value.label.universal || null,
  // };

  // description.value = {
  //   en: document.value.description.en || null,
  //   de: document.value.description.de || null,
  //   pt: document.value.description.pt || null,
  //   universal: document.value.description.universal || null,
  // };
}

getDocument()

async function updateDocument() {
  await terminusStore.updateDocument([
    {
      '@id': id.value,
      '@type': document.value['@type'],
      ...Object.fromEntries(frame.value.map((p) => [p.key, p.value]))
    }
  ])
  router.go(-1)
}

async function deleteDocument() {
  await terminusStore.deleteDocument(id.value)
  router.go(-1)
}
// const match = ref([]);
</script>

<template>
  <TheHeader>
    <template v-slot:left><h1>Edit</h1></template>
    <!-- <template v-slot:right>
      <InputButton class="large" @click="router.go(-1)"> cancel </InputButton>
    </template> -->
  </TheHeader>
  <main>
    <div class="form">
      <template v-for="(prop, i) in frame" :key="i">
        <template v-if="prop.input === 'text'">
          <InputTextMulti
            v-if="prop.isSet || prop.type === 'text'"
            :label="prop.label.text"
            :lang="prop.label.lang"
            v-model="prop.value"
          />
          <InputText v-else :label="prop.label.text" :lang="prop.label.lang" v-model="prop.value" />
        </template>
        <template v-else>
          <InputSelectMulti
            v-if="prop.isSet"
            :label="prop.label.text"
            :lang="prop.label.lang"
            v-model="prop.value"
            :options="prop.options"
          />
          <InputSelect
            v-else
            :label="prop.label.text"
            :lang="prop.label.lang"
            v-model="prop.value"
            :options="prop.options"
          />
        </template>
      </template>
      <!-- <component
        v-for="(f, i) in frame"
        :key="i"
        :is="f.type === 'text' ? InputTextMulti : InputTextMulti"
        :label="f.label"
        :v-model="f.value"
      /> -->
      <!-- <InputTextMulti :label="frame[0].label" v-model="frame[0].value" /> -->
      <!-- <InputTextMulti label="description" v-model="description" /> -->
      <!-- <InputTextMulti label="label" secondary-label="en" v-model="match" /> -->
      <div class="button-group">
        <InputButton primary @click="updateDocument">save changes</InputButton>
        <InputButton secondary @click="router.go(-1)">cancel</InputButton>
        <InputButton secondary danger @click="deleteDocument">delete</InputButton>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
main {
  margin: var(--spacing) var(--spacing) var(--spacing) var(--offset-left);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);

  nav {
    display: flex;
    gap: var(--spacing-l);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
  }

  .button-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-s);
    margin-left: calc(var(--spacing) * -1);
  }
}
</style>
