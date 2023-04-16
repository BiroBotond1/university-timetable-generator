<template>
    <v-app>
    <Sidebar />
    <v-main>
      <v-container fluid>
        <ClassCatalog />
    <router-view></router-view>
  </v-container>
    </v-main>
    </v-app>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  
  // Components
  import Sidebar from '../components/Side_bar.vue'
  import ClassCatalog from '../components/Class/ClassCatalog.vue'

  export default defineComponent({
    name: 'Side_bar',
  
    components: {
        Sidebar,
        ClassCatalog,
  },
  });
  </script>
  