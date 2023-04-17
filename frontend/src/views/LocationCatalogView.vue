<template>
    <v-app>
    <Sidebar />
    <v-main>
      <v-container fluid>
        <LocationCatalogs />
    <router-view></router-view>
  </v-container>
    </v-main>
    </v-app>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  
  // Components
  import Sidebar from '../components/Side_bar.vue'
  import LocationCatalogs from '../components/Location/LocationCatalogs.vue'

  export default defineComponent({
    name: 'Side_bar',
  
    components: {
        Sidebar,
        LocationCatalogs,
  },
  });
  </script>
  