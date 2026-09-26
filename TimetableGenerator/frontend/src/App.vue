<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
import { useAuth0 } from '@auth0/auth0-vue'
import Api from '@/modules/app/fetch.service'
import { connectSocket, disconnectSocket } from '@/modules/app/app.socket'
import { useAppStore } from '@/modules/app/app.store'
import {
  emitSyncUser,
  setupUserSocketListeners
} from "@/modules/auth0/auth0.socket";

const { getAccessTokenSilently,  user, isAuthenticated, isLoading  } = useAuth0()
const appStore = useAppStore()

let teardownUserListeners: (() => void) | null = null

// Set the fetcher during setup / onMounted (inside a component's context)
onMounted(() => {
  Api.setFetcher(async (path: string) => {
    const token = await getAccessTokenSilently()
    const resp = await fetch(`http://127.0.0.1:3000/api/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return resp
  })

  teardownUserListeners = setupUserSocketListeners((syncedUser) => {
    appStore.currentUser = syncedUser
  })
})

onUnmounted(() => {
  teardownUserListeners?.()
  disconnectSocket()
})

watch(isAuthenticated, async (value) => {
  if (!value) {
    appStore.currentUser = null
    disconnectSocket()
    return
  }

  await getAccessTokenSilently()  // forces hydration

  // The server rejects unauthenticated handshakes, so connect before emitting.
  connectSocket(() => getAccessTokenSilently())

  emitSyncUser({
    username: user.value?.nickname,
    email: user.value?.email,
  })
});
</script>
