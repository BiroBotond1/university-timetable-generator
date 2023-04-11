<template>
    <v-app>
    <Sidebar />
    <v-main>
      <v-container fluid>
        <ClassesDataTable />
    <router-view></router-view>
  </v-container>
    </v-main>
    </v-app>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  
  // Components
  import Sidebar from '../components/Side_bar.vue'
  import ClassesDataTable from '../components/Class/ClassesDataTable.vue'

  export default defineComponent({
    name: 'Side_bar',
  
    components: {
        Sidebar,
        ClassesDataTable,
  },
  });
  </script>
  