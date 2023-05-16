<script setup>
import TheHeader from '@/components/TheHeader.vue'
import InputButton from '@/components/InputButton.vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import InputTextMulti from '../components/InputTextMulti.vue'
import { useTerminusStore } from '@/stores/terminus'
import { ref } from 'vue'
import BaseNav from '../components/BaseNav.vue'

const route = useRoute()
const router = useRouter()
const terminusStore = useTerminusStore()

const label = ref({ en: null, de: null, pt: null, universal: null })
const description = ref({ en: null, de: null, pt: null, universal: null })

async function addDocument() {
  const res = await terminusStore.addDocument([
    {
      '@type': `${route.params.type}`,
      label: label.value,
      description: description.value
    }
  ])
  console.log(res)
  router.go(-1)
}
</script>

<template>
  <TheHeader>
    <template v-slot:left><h1>Create</h1></template>
    <!-- <template v-slot:right>
      <InputButton class="large" @click="router.go(-1)"> cancel </InputButton>
    </template> -->
  </TheHeader>
  <main>
    <BaseNav>
      <RouterLink :to="{ name: 'create', params: { type: 'graph' } }" replace> Canvas </RouterLink>
      <RouterLink :to="{ name: 'create', params: { type: 'entity' } }" replace> Entity </RouterLink>
      <RouterLink :to="{ name: 'create', params: { type: 'class' } }" replace> Class </RouterLink>
      <RouterLink :to="{ name: 'create', params: { type: 'property' } }" replace>
        Property
      </RouterLink>
    </BaseNav>
    <div class="form">
      <InputTextMulti label="label" v-model="label" />
      <InputTextMulti label="description" v-model="description" />
      <!-- <InputTextMulti label="label" secondary-label="en" v-model="match" /> -->
      <div class="button-group">
        <InputButton primary @click="addDocument">Create {{ route.meta.filter }}</InputButton>
        <InputButton secondary @click="router.go(-1)">cancel</InputButton>
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
