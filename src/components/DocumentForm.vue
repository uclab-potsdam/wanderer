<script setup>
import InputTextMulti from '../components/InputTextMulti.vue'
import InputText from '../components/inputs/InputText.vue'
import InputSelect from '../components/inputs/InputSelect.vue'
import InputSelectMulti from '../components/InputSelectMulti.vue'
import { useTerminusStore } from '@/stores/terminus'
import { useViewStore } from '@/stores/view'
import { ref, watch } from 'vue'

const terminusStore = useTerminusStore()
const viewStore = useViewStore()

const frame = ref([])
const props = defineProps({ type: String, modelValue: Object })
const emit = defineEmits(['update:modelValue'])

async function getFrame() {
  const schema = (await terminusStore.getSchema())[props.modelValue['@type']]
  frame.value = await Promise.all(
    Object.keys(schema)
      .filter((key) => /^[^@]/.test(key))
      .sort((a, b) => {
        // TODO: #17 define property order in schema
        if (a === 'label') return -1
        if (a === 'description' && b === 'label') return 1
        if (a === 'description') return -1
        return 1
      })
      .map(async (key) => {
        // console.log(key)
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

        const isEnum = type['@type'] === 'Enum'

        const hidden = schema['@key']?.['@fields']?.includes(key)

        const input = type === 'text' || /:/.test(type) ? 'text' : 'select'

        let value = props.modelValue[key]
        if (type === 'text') {
          value = Object.fromEntries(
            terminusStore.languages.map((lang) => [lang, props.modelValue[key]?.[lang] || null])
          )
        }

        if (isSet && value == null) {
          value = []
        }

        let options = []
        if (type !== 'text' && isSet && !/:/.test(type)) {
          if (type['@type'] === 'Enum') {
            options = type['@values']
          } else {
            options = (await terminusStore.getDocumentsByType(type)).map((doc) => ({
              value: doc['@id'],
              label: viewStore.localize(doc.label)
            }))
          }
        }

        return {
          key,
          label,
          isSet,
          isEnum,
          input,
          type,
          value,
          options,
          hidden
        }
      })
  )
}

getFrame()

watch(
  () => props.modelValue['@type'],
  () => {
    getFrame()
  }
)
watch(
  () => props.modelValue['@id'],
  () => {
    getFrame()
  }
)

watch(
  frame,
  () => {
    emit('update:modelValue', {
      // '@id': id.value,
      ...(props.modelValue['@id'] != null && { '@id': props.modelValue['@id'] }),
      '@type': props.modelValue['@type'],
      ...Object.fromEntries(frame.value.map((p) => [p.key, p.value]))
    })
  },
  { deep: true }
)
</script>

<template>
  <div class="form">
    <template v-for="(prop, i) in frame" :key="i">
      <template v-if="!prop.hidden">
        <template v-if="prop.isEnum">
          <span :style="{ 'font-size': 'var(--font-size-s)' }">{{ prop.label.text }}</span>
          <select v-model="prop.value">
            <option :value="null">–</option>
            <option v-for="v in prop.type['@values']" :key="v" :value="v">{{ v }}</option>
          </select>
        </template>
        <template v-else-if="prop.input === 'text'">
          <InputTextMulti
            v-if="prop.isSet || prop.type === 'text'"
            :label="prop.label.text"
            :lang="prop.label.lang"
            v-model="prop.value"
          />
          <InputText
            v-else
            class="single-input"
            :label="prop.label.text"
            :lang="prop.label.lang"
            v-model="prop.value"
          />
        </template>
        <template v-else>
          <InputSelectMulti
            v-if="prop.isSet"
            :label="prop.label.text"
            :lang="prop.label.lang"
            allow-null
            v-model="prop.value"
            :options="prop.options"
          />
          <div v-else>
            <InputSelect :label="prop.label.text" :lang="prop.label.lang" v-model="prop.value" :type="prop.type" />
          </div>
        </template>
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-l);
  align-items: flex-start;

  :deep(input) {
    width: var(--input-width);
  }
}
</style>
