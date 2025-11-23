<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
import { useAuth0 } from '@auth0/auth0-vue'
import Api from '@/modules/app/fetch.service'

const { getAccessTokenSilently } = useAuth0()

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
})
</script>
