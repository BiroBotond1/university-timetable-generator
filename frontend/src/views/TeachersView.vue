<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <Sidebar />
        <TeachersDataTable />
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>
  
  <script>
  import { defineComponent } from 'vue';
  
  // Components
  import Sidebar from '../components/Side_bar.vue'
  import TeachersDataTable from '../components/Teacher/TeachersDataTable.vue'

  export default defineComponent({
    name: 'Side_bar',
  
    components: {
        Sidebar,
        TeachersDataTable,
  },
  });
  </script>
  