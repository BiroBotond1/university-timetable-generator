import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SyncedUser } from '@/modules/auth0/user.type'

export const useAppStore =  defineStore('app', () => {
  const projectId = ref<string|null>(null)
  // Set once the socket sync replies.
  const currentUser = ref<SyncedUser|null>(null)
  // Message for the app-wide snackbar.
  const flash = ref<string|null>(null)

  return {
    projectId,
    currentUser,
    flash
  }
})
