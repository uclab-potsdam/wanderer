<script setup>
import InputButton from '@/components/InputButton.vue'
import InputText from '@/components/InputText.vue'
import TheHeader from '@/components/TheHeader.vue'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTerminusStore } from '@/stores/terminus'
import { useRouter } from 'vue-router'
import { ACCESS_WRITE } from '@/assets/js/constants'

const authStore = useAuthStore()
const terminusStore = useTerminusStore()

const router = useRouter()

const user = ref(null)
const key = ref(null)

async function signIn() {
  authStore.updateCredentials(user.value, key.value)
  await terminusStore.connect(ACCESS_WRITE)
  router.push({ name: 'home' })
}
</script>

<template>
  <TheHeader>
    <template v-slot:left><h1>Sign in to Workbench</h1></template>
  </TheHeader>
  <main>
    <InputText v-model="user" label="user" :options="{ type: 'email', autocomplete: 'username' }" />
    <InputText
      v-model="key"
      label="password"
      :options="{ type: 'password', autocomplete: 'current-password' }"
    />
    <InputButton @click="signIn"> sign in </InputButton>
  </main>
</template>

<style lang="scss" scoped>
main {
  margin: var(--spacing) var(--spacing) var(--spacing) var(--offset-left);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-l);
  align-items: flex-start;
}
</style>
