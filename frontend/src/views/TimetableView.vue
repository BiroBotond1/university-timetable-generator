<template>
    <Sidebar />
</template>
  
  <script>
  import { defineComponent } from 'vue';
  
  // Components
  import Sidebar from '../components/Side_bar.vue'
  
  export default defineComponent({
    name: 'Side_bar',
  
    components: {
        Sidebar,
  },
  });
  </script>
