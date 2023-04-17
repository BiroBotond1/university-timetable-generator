
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
          v-for="item in teachers"
          :key="item._id"
          :class="{active: item._id === $refs.teacherCatalog.teacherID}"
          @click="selectTeacher(item._id)">
            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
    </v-navigation-drawer>
    <teacherCatalog ref="teacherCatalog"/>
</v-app>
 </template>
 
 <script>
import axios from 'axios'
import teacherCatalog from './TeacherCatalog.vue'
 export default {
    data () {
      return {
        teachers: "",
      }
    },

    async created () {
      await this.fetchTeachers()
    },

    components: {
        teacherCatalog
    },

    methods: {
        async fetchTeachers() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/teacher')
          .catch(error => console.log(error))
          this.teachers = response.data.data
        },
        selectTeacher(teacherID) {
            this.$refs.teacherCatalog.teacherID = teacherID
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