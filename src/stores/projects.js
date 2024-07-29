import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { useConstantStore } from './constant'
import { computed, ref } from 'vue'
import { io } from 'socket.io-client'

export const useProjectsStore = defineStore('projects', () => {
  const constantStore = useConstantStore()

  const projectList = useStorage('wanderer-projects', [])
  const projectId = useStorage('project', null)
  const projectData = ref(null)

  let socket = null

  const projects = computed(() => {
    return projectList.value
      .toSorted((a, b) => (a.opened < b.opened ? 1 : -1))
      .map((p) => ({
        ...p,
        opened: new Date(p.opened)
      }))
  })

  const project = computed(() => {
    return projectList.value.find((p) => p.id === projectId.value)
  })

  async function importFromStatic() {
    const data = await fetch(constantStore.wandererStatic).then((d) => d.json())
    addProject(null, data)
  }

  function open(id) {
    const available = projectList.value.find((p) => p.id === id)
    if (available) {
      available.opened = new Date()
      projectId.value = id
    } else {
      projectList.value.push({
        id,
        opened: new Date(),
        remote: true
      })
    }
  }

  async function initData() {
    if (project.value == null) {
      projectData.value = await fetch(constantStore.wandererStatic).then((d) => d.json())
    } else if (!project.value.remote) {
      projectData.value = JSON.parse(localStorage.getItem(`wanderer-${project.value.id}`))
    } else {
      socket = io(constantStore.wandererServer)
      socket.emit('fetch')
      socket.on('data', (d) => {
        projectData.value = d
      })
    }
  }

  function storeData(data) {
    localStorage.setItem(`wanderer-${projectId.value}`, JSON.stringify(data))
  }

  function addProject(id, data = {}, remote = false) {
    id = id ?? crypto.randomUUID()
    projectList.value.push({ id, remote, opened: new Date() })
    if (!remote) {
      localStorage.setItem(`wanderer-${id}`, JSON.stringify(data))
      open(id)
    } else {
      console.log('remote')
    }
  }

  function deleteProject(id, all) {
    if (!all) {
      projectList.value = projectList.value.filter((project) => project.id !== id)
      localStorage.removeItem(`wanderer-${id}`)
    } else {
      // update()
      const storage = { ...localStorage }
      Object.keys(storage)
        .filter((key) => /^wanderer-/.test(key))
        .forEach((key) => localStorage.removeItem(key))
      projectList.value = []
    }
    if (id === projectId.value || all) {
      projectId.value = null
    }
  }

  return {
    projects,
    importFromStatic,
    open,
    projectId,
    project,
    projectData,
    addProject,
    deleteProject,
    storeData,
    initData
  }
})
