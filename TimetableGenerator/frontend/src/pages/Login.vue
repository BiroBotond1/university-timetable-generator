<template>      
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'

const { loginWithRedirect } = useAuth0()

loginWithRedirect()

</script>

<route lang="yaml">
meta:
  layout: auth
</route>