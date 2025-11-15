<template>
  <v-app color="background">
    <SideBar />
    <v-main class="ma-4" fluid>
      <router-view />
    </v-main>
  </v-app>
</template>

<style>
html {
  overflow-y: auto !important;
}
</style>