<template>
  <v-app>
    <Sidebar />
    <v-main>
      <v-container fluid>
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
