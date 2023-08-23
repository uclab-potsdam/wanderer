import { defineStore, acceptHMRUpdate } from 'pinia'

export const usePermanentStore = defineStore('auth', () => {
  function setCredentials(user, pass) {
    localStorage.setItem('USER', user)
    localStorage.setItem('PASS', pass)
  }

  function clearCredentials() {
    localStorage.removeItem('USER')
    localStorage.removeItem('PASS')
  }

  function setMode(value) {
    localStorage.setItem('MODE', value)
  }
  function getMode() {
    return +localStorage.getItem('MODE')
  }

  return { setCredentials, clearCredentials, setMode, getMode }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePermanentStore, import.meta.hot))
}
