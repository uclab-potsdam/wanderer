<script setup>
import InputText from '@/components/inputs/InputText.vue'
import BaseButton from '@/components/BaseButton.vue'
import { usePermanentStore } from '@/stores/permanent'
import { useTerminusStore } from '@/stores/terminus'
import { ref } from 'vue'

const permanentStore = usePermanentStore()
const terminusStore = useTerminusStore()

const user = ref(null)
const pass = ref(null)

// const signedIn = ref(false)

const errorMessage = ref(null)

async function signIn() {
  const status = await terminusStore.connect(user.value, pass.value)
  switch (status) {
    case 'SUCCESS':
      permanentStore.setCredentials(user.value, pass.value)
      // signedIn.value = true
      errorMessage.value = null
      break
    case 'INCORRECT_CREDENTIALS':
      errorMessage.value = 'Incorrect username or password'
      break
    default:
      errorMessage.value = 'Unexpected Error'
      break
  }
}
async function signOut() {
  permanentStore.clearCredentials()
  const status = await terminusStore.connect()
  switch (status) {
    case 'SUCCESS':
      // signedIn.value = false
      errorMessage.value = null
      break
    default:
      errorMessage.value = 'Unexpected Error'
      break
  }
}
</script>

<template>
  <section class="modal-settings-account">
    <div class="label">
      <span>Account</span>
      <span v-if="errorMessage" class="error">{{ errorMessage }}</span>
    </div>
    <template v-if="!terminusStore.isSignedIn">
      <InputText
        v-model="user"
        label="Username"
        :options="{ autocomplete: 'username' }"
      ></InputText>
      <InputText
        v-model="pass"
        label="Password"
        :options="{ type: 'password', autocomplete: 'current-password' }"
      ></InputText>
      <BaseButton primary @click="signIn" :disabled="!user || !pass">Sign in</BaseButton>
    </template>
    <template v-else>
      <div class="account">
        <span class="greeting">
          Hello
          <span class="username">{{ terminusStore.userInfo?.name }}!</span>
          <div class="roles">
            <span v-for="role in terminusStore.userInfo.roles" :key="role['@id']" class="role">{{
              role.name
            }}</span>
          </div>
        </span>
        <BaseButton secondary @click="signOut">Sign out</BaseButton>
      </div>
    </template>
  </section>
</template>

<style lang="scss" scoped>
.modal-settings-account {
  display: grid;
  gap: var(--spacing);

  .label {
    display: flex;
    justify-content: space-between;
    .error {
      color: var(--ui-error);
      font-weight: var(--bold);
    }
  }

  .account {
    display: grid;
    grid-auto-columns: 2fr 1fr;
    grid-auto-flow: column;
    align-items: center;
    .greeting {
      font-size: var(--font-size);

      .username {
        text-transform: capitalize;
      }

      .roles {
        font-size: var(--font-size-s);
        color: var(--ui-text-muted);
        .role + .role:before {
          content: ', ';
        }
      }
    }
  }
}
</style>
