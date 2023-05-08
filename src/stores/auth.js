import { defineStore, acceptHMRUpdate } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  function updateCredentials(user, key) {
    localStorage.setItem('USER', user)
    localStorage.setItem('KEY', key)
  }

  function clearCredentials() {
    localStorage.removeItem('USER')
    localStorage.removeItem('KEY')
  }

  return { updateCredentials, clearCredentials }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
