
<template>
    <div app>
    <v-navigation-drawer
        color="#1D0C59"
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
    <div class="color-container">
      <div class="color-box subjectColor"></div>
      <div class="color-label">Subject</div>
      <div class="color-box teacherColor"></div>
      <div class="color-label">Teacher</div>
      <div class="color-box locationColor"></div>
      <div class="color-label">Location</div>
    </div>
  </div>
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
      if(this.classes.length > 0) {
        this.selectClass(this.classes[0]._id)
      }
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
.subjectColor {
  background-color: #000000;
}

.teacherColor {
  background-color:#443dafb5;
}

.locationColor {
  background-color: #2b762e;
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