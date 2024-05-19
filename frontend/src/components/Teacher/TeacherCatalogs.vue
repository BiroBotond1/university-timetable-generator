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
    <teacherCatalog id="teacherCatalog" ref="teacherCatalog"/>
    <div class="color-container">
      <div class="color-box subjectColor"></div>
      <div class="color-label">Subject</div>
      <div class="color-box classColor"></div>
      <div class="color-label">Class</div>
      <div class="color-box locationColor"></div>
      <div class="color-label">Location</div>
    </div>
    <br>
    <v-btn class="white--text" color="#1E88E5" block @click="print"> Print</v-btn>
  </div>
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
      if(this.teachers.length > 0) {
        this.selectTeacher(this.teachers[0]._id)
      }
    },

    components: {
        teacherCatalog
    },

    methods: {
        async fetchTeachers() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/teachers')
          .catch(error => console.log(error))
          this.teachers = response.data.data
        },
        selectTeacher(teacherID) {
            this.$refs.teacherCatalog.teacherID = teacherID
            this.$forceUpdate();
        },
        print() {
          const prtHtml = document.getElementById('teacherCatalog').innerHTML;
          let stylesHtml = '';
          for (const node of [...document.querySelectorAll('link[rel="stylesheet"], style')]) {
            stylesHtml += node.outerHTML;
          }
          const WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
          WinPrint.document.write(`<!DOCTYPE html>
          <html>
            <head>
              ${stylesHtml}
            </head>
            <body>
              ${prtHtml}
            </body>
          </html>`);

          WinPrint.document.close();
          WinPrint.focus();
          WinPrint.print();
          WinPrint.close();
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

.locationColor {
  background-color:#2b762e;
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