import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SyncedUser } from '@/modules/auth0/user.type'

export const useAppStore =  defineStore('app', () => {
  const generating = ref(false)
  const notification = ref(false)
  const projectId = ref<string|null>(null)
  // The Mongo user behind the Auth0 identity; set once the socket sync replies.
  const currentUser = ref<SyncedUser|null>(null)
  // A one-off message for the app-wide snackbar.
  const flash = ref<string|null>(null)

  return {
    generating,
    notification,
    projectId,
    currentUser,
    flash
  }
})
