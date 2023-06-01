<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <Sidebar />
        <TimetableInitializer />
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { defineComponent } from 'vue';

// Components
import TimetableInitializer from '../components/TimetableInitializer.vue'
import Sidebar from '../components/Side_bar.vue'

export default defineComponent({
  name: 'GeneratorView',

  components: {
    TimetableInitializer,
    Sidebar,
},
});
</script>
