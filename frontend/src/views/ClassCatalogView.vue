<template>
  <v-app >
    <v-main>
      <v-container fluid>
        <Sidebar />
        <ClassCatalogs />
        <router-view></router-view>
        </v-container>
    </v-main>
  </v-app>
</template>
  
  <script>
  import { defineComponent } from 'vue';
  
  // Components
  import Sidebar from '../components/Side_bar.vue'
  import ClassCatalogs from '../components/Class/ClassCatalogs.vue'

  export default defineComponent({
    name: 'Side_bar',
  
    components: {
        Sidebar,
        ClassCatalogs,
  },
  });
  </script>
  