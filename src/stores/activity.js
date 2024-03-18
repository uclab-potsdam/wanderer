import { defineStore } from 'pinia'
import { ref } from 'vue'

const INACTIVITY_SHORT = 3500
const INACTIVITY_LONG = 10000

export const useActivityStore = defineStore('activity', () => {
  const activityTrackingController = new AbortController()
  let lastActivity = document.timeline.currentTime
  const inactivity = ref(0)
  let tracking = false
  const inactivityShort = ref(false)
  const inactivityLong = ref(false)

  function updateActivity(t) {
    inactivity.value = t - lastActivity
    if (
      (inactivity.value < INACTIVITY_SHORT && inactivityShort.value) ||
      (inactivity.value > INACTIVITY_SHORT && !inactivityShort.value)
    ) {
      inactivityShort.value = !inactivityShort.value
    }

    if (
      (inactivity.value < INACTIVITY_LONG && inactivityLong.value) ||
      (inactivity.value > INACTIVITY_LONG && !inactivityLong.value)
    ) {
      inactivityLong.value = !inactivityLong.value
    }

    if (tracking) {
      requestAnimationFrame(updateActivity)
    }
  }

  function registerActivity() {
    lastActivity = document.timeline.currentTime
  }

  function startActivityTracking() {
    tracking = true
    requestAnimationFrame(updateActivity)

    const options = { signal: activityTrackingController.signal }
    window.addEventListener('wheel', registerActivity, options)
    window.addEventListener('mousemove', registerActivity, options)
    window.addEventListener('touchstart', registerActivity, options)
    window.addEventListener('touchmove', registerActivity, options)
    window.addEventListener('dragstart', registerActivity, options)
    window.addEventListener('touchend', registerActivity, options)
    window.addEventListener('keydown', registerActivity, options)
    window.addEventListener('touchcancel', registerActivity, options)
  }

  function stopActivityTracking() {
    activityTrackingController.abort()
    tracking = true
  }

  return {
    startActivityTracking,
    stopActivityTracking,
    inactivityShort,
    inactivityLong
  }
})
