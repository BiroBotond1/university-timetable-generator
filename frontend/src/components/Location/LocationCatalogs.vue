
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
          v-for="item in locations"
          :key="item._id"
          :class="{active: item._id === $refs.locationCatalog.locationID}"
          @click="selectLocation(item._id)">
            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
    </v-navigation-drawer>
    <locationCatalog ref="locationCatalog"/>
</v-app>
 </template>
 
 <script>
import axios from 'axios'
import locationCatalog from './LocationCatalog.vue'
 export default {
    data () {
      return {
        locations: "",
      }
    },

    async created () {
      await this.fetchLocations()
    },

    components: {
        locationCatalog
    },

    methods: {
        async fetchLocations() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/location')
          .catch(error => console.log(error))
          this.locations = response.data.data
        },
        selectLocation(locationID) {
            this.id = locationID
            this.$refs.locationCatalog.locationID = locationID
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