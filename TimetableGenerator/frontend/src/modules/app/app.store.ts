import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore =  defineStore('app', () => {
  const generating = ref(false)
  const notification = ref(false)
  const projectId = ref<string|null>(null)
 
  return {
    generating,
    notification,
    projectId
  }
})
