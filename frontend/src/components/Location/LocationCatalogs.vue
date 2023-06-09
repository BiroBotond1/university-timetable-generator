
<template>
    <v-app>
    <v-navigation-drawer
        color="#1D0C59"
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
    <div class="color-container">
      <div class="color-box subjectColor"></div>
      <div class="color-label">Subject</div>
      <div class="color-box classColor"></div>
      <div class="color-label">Class</div>
      <div class="color-box teacherColor"></div>
      <div class="color-label">Teacher</div>
    </div>
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
      if(this.locations.length > 0) {
        this.selectLocation(this.locations[0]._id)
      }
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

.subjectColor {
  background-color: #000000;
}

.classColor {
  background-color:#ff2b2bba;
}

.teacherColor {
  background-color:#443dafb5;
}

.active {
  background: rgb(105, 105, 105);
}

.color-container {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.color-box {
  width: 18px;
  height: 18px;
  margin: 2px;
}

.color-label {
  margin-top: 2px;
  text-align: center;
  margin-right: 15px;
}
</style>