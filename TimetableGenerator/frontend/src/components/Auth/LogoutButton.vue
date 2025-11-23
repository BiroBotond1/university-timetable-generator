<template>
  <v-btn variant="text" rounded :disabled="isLoading.value" @click="handleLogout">
    {{ isLoading ? 'Loading...' : 'Log Out' }}
  </v-btn>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'

const { logout, isLoading } = useAuth0()

const handleLogout = () => {
  logout({
    logoutParams: {
      returnTo: window.location.origin
    }
  })
}
</script>