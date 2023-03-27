<template>
  <Sidebar />
  <TimetableInitializer />
</template>

<script>
import { defineComponent } from 'vue';

// Components
import TimetableInitializer from '../components/TimetableInitializer.vue'
import Sidebar from '../components/Side_bar.vue'

export default defineComponent({
  name: 'HomeView',

  components: {
    TimetableInitializer,
    Sidebar,
},
});
</script>
