import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAppStore } from '../app/app.store'
import { fetchGenerationRuns } from './generation.api'
import type { GenerationRunData } from './generation.type'

export type GenerationAlert = 'success' | 'warning' | 'failure'

const OPEN = ['queued', 'running']
const KEPT = 20

// The open project's recent runs, newest first, kept current by the socket
// events so that every tab shows the same state.
export const useGenerationStore = defineStore('generation', () => {
  const runs = ref<GenerationRunData[]>([])
  const alert = ref<GenerationAlert | null>(null)
  let alertTimer: ReturnType<typeof setTimeout> | null = null

  const latest = computed(() => runs.value[0] ?? null)
  const generating = computed(() => !!latest.value && OPEN.includes(latest.value.status))

  const load = async () => {
    try {
      runs.value = await fetchGenerationRuns()
    } catch (error) {
      console.log(error)
    }
  }

  const dismissAlert = () => {
    if (alertTimer) clearTimeout(alertTimer)
    alertTimer = null
    alert.value = null
  }

  const clear = () => {
    runs.value = []
    dismissAlert()
  }

  // A success needs nothing from the user; a warning or a failure stays until
  // it has been seen.
  const showAlert = (kind: GenerationAlert) => {
    dismissAlert()
    alert.value = kind
    if (kind === 'success') {
      alertTimer = setTimeout(dismissAlert, 5000)
    }
  }

  // Replaces the run's earlier record, or adds it as the newest.
  const apply = (run: GenerationRunData) => {
    // An event from the previous project can still be on its way after a switch.
    if (String(run.project) !== useAppStore().projectId) return

    const index = runs.value.findIndex(existing => existing._id === run._id)
    runs.value = index === -1
      ? [run, ...runs.value].slice(0, KEPT)
      : runs.value.map(existing => existing._id === run._id ? run : existing)

    if (run.status === 'succeeded') {
      showAlert(run.result?.active === false ? 'warning' : 'success')
    } else if (run.status === 'failed') {
      showAlert('failure')
    }
  }

  return {
    runs,
    latest,
    generating,
    alert,
    load,
    clear,
    apply,
    dismissAlert,
  }
})
