<template>
  <v-icon class="flex align-center w-full my-1" :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'" v-if="!showLabel" />
  <v-btn 
    v-else
    variant="text"
    @click="toggleTheme"
    class="d-flex align-center py-2 text-left"
  >
    <v-icon class="mr-2">
      {{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
    </v-icon>

    <span class="text-body-2">
      {{ isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme' }}
    </span>
  </v-btn>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTheme } from 'vuetify'

const props = defineProps<{
  showLabel: boolean
}>()

const vuetifyTheme = useTheme()
const isDark = ref(false)

onMounted(() => {
  initializeTheme()
})

// Initializes theme based on:
// localStorage.theme
// OS preference (if theme not stored)
function initializeTheme() {
  const stored = localStorage.getItem("theme")

  if (stored === "dark") {
    isDark.value = true
  } else if (stored === "light") {
    isDark.value = false
  } else {
    isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches
  }

  applyTheme()
}

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.theme = isDark.value ? "dark" : "light"
  applyTheme()
}

function applyTheme() {
  vuetifyTheme.global.name.value = isDark.value ? "customDark" : "customLight"

  document.documentElement.classList.toggle("dark", isDark.value)
}
</script>
