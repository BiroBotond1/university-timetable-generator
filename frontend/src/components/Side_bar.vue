<template>
   
      <v-app-bar
        app
        color="primary"
        density="compact"
      >
      <v-app-bar-nav-icon> </v-app-bar-nav-icon>
      <v-toolbar-title>Timetable generator</v-toolbar-title>
      <v-spacer></v-spacer>
      <router-link to="/timetable" ><v-btn icon> <v-icon>mdi-thumb-up </v-icon> </v-btn> </router-link>
      <router-link to="/"><v-btn icon>
        <v-icon>mdi-thumb-down</v-icon>
      </v-btn>
      </router-link>
      </v-app-bar>
</template>

<script setup>

</script>

<style>

</style>