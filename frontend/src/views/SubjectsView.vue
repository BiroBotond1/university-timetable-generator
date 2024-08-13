<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <Sidebar />
        <SubjectsDataTable />
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { defineComponent } from 'vue';

// Components
import Sidebar from '../components/Side_bar.vue'
import SubjectsDataTable from '../components/Subject/SubjectsDataTable.vue'

export default defineComponent({
  name: 'Side_bar',

  components: {
    Sidebar,
    SubjectsDataTable,
  },
});
</script>
