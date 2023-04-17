
<template>
    <v-app>
    <v-navigation-drawer
        app 
        permanent
        clipped 
        dark 
        right>
      <v-list dense nav>
          <v-list-item 
          v-for="item in classes"
          :key="item._id"
          :class="{active: item._id === $refs.classCatalog.classID}"
          @click="selectClass(item._id)">
            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
    </v-navigation-drawer>
    <classCatalog ref="classCatalog"/>
</v-app>
 </template>
 
 <script>
import axios from 'axios'
import classCatalog from './ClassCatalog.vue'
 export default {
    data () {
      return {
        classes: [],
      }
    },

    async created () {
      await this.fetchClasses()
    },

    components: {
        classCatalog
    },

    methods: {
        async fetchClasses() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/class')
          .catch(error => console.log(error))
          this.classes = response.data.data
        },
        selectClass(classID) {
            this.$refs.classCatalog.classID = classID
            this.$forceUpdate();
        }
    },
}
  
</script>
 

<style>
.active {
  background: rgb(105, 105, 105);
}
</style>