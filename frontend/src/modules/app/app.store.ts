import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore =  defineStore('app', () => {
  const generating = ref(false)
  const notification = ref(false)
 
  return {
    generating,
    notification
  }
})
