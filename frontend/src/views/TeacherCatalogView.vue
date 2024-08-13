<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <Sidebar />
        <TeacherCatalogs />
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { defineComponent } from 'vue';

// Components
import Sidebar from '../components/Side_bar.vue'
import TeacherCatalogs from '../components/Teacher/TeacherCatalogs.vue'

export default defineComponent({
  name: 'Side_bar',

  components: {
    Sidebar,
    TeacherCatalogs,
  },
});
</script>