<template>
    <v-app>
    <Sidebar />
    <v-main>
      <v-container fluid>
    <router-view></router-view>
  </v-container>
    </v-main>
    </v-app>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  
  // Components
  import Sidebar from '../components/Side_bar.vue'

  export default defineComponent({
    name: 'Side_bar',
  
    components: {
        Sidebar,
  },
  });
  </script>
  