<template>
  <v-app color="F2F2F2">
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