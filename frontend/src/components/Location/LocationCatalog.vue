
<template>
    <v-data-table app
    :items-per-page="-1"
    hide-default-footer
    :headers="headers"
    :items="items"
    class="border">
        <template v-slot:[`item.monday`]="{ item }"> 
            <ClassHourComponent :hour="catalog[0][convertHourToInt(item.hours)]" />
        </template>
        <template v-slot:[`item.tuesday`]="{ item }"> 
            <ClassHourComponent :hour="catalog[1][convertHourToInt(item.hours)]" />
        </template>
        <template v-slot:[`item.wednesday`]="{ item }"> 
            <ClassHourComponent :hour="catalog[2][convertHourToInt(item.hours)]" />
        </template>
        <template v-slot:[`item.thursday`]="{ item }"> 
            <ClassHourComponent :hour="catalog[3][convertHourToInt(item.hours)]" />
        </template>
        <template v-slot:[`item.friday`]="{ item }"> 
            <ClassHourComponent :hour="catalog[4][convertHourToInt(item.hours)]" />
        </template>
    </v-data-table>
 </template>
 
 <script>
import axios from 'axios'
import Vue from 'vue'
import ClassHourComponent from '../ClassHour.vue'

 export default {
    data () {
      return {
        headers: [
            {text: "Hours", value: "hours"},
            {text: "Monday", value: "monday"},
            {text: "Tuesday", value: "tuesday"},
            {text: "Wednesday", value: "wednesday"},
            {text: "Thursday", value: "thursday"},
            {text: "Friday", value: "friday"},
        ],
        items: [
            {hours: "8-9"},
            {hours: "9-10"},
            {hours: "10-11"},
            {hours: "11-12"},
            {hours: "12-13"},
            {hours: "13-14"},
            {hours: "14-15"},
            {hours: "15-16"}
        ],
        locationID: '',
        teachers: [],
        locations: [],
        classes: [],
        catalog:
           [["", "", "", "", "", "", "", ""],
           ["", "", "", "", "", "", "", ""],
           ["", "", "", "", "", "", "", ""],
           ["", "", "", "", "", "", "", ""],
           ["", "", "", "", "", "", "", ""]],
        active: true,
      }
    },

    async created () {
      await this.fetchCatalog()
    },

    components: {
        ClassHourComponent
    },

    watch: {
    async locationID() {
       await this.fetchCatalog()
    }
  },

    methods: {
        async fetchSubjects() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/subjects')
          .catch(error => console.log(error))
          this.subjects = response.data.data
        },
        async fetchTeachers() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/teachers')
          .catch(error => console.log(error))
          this.teachers = response.data.data
        },
        async fetchClasses() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/classes')
          .catch(error => console.log(error))
          this.classes = response.data.data
        },
        async fetchCatalog() {
          await this.fetchClasses()
          await this.fetchSubjects()
          await this.fetchTeachers()
          let response = await axios.
          get('http://127.0.0.1:3000/api/locations/' + this.locationID)
          .catch(error => console.log(error))
          let catalogClassHours = response.data.data.catalog
          for(var day = 0; day < this.catalog.length; day++)
          {
            for(var hour = 0; hour < this.catalog[day].length; hour++) {
                let classHour = {}
                if(!catalogClassHours) {
                    classHour.subject = ''
                    classHour.class = ''
                    classHour.teacher = ''
                    Vue.set(this.catalog[day], hour, classHour)
                    continue
                }
                if (catalogClassHours[day][hour] === '') {
                    classHour.subject = ''
                    classHour.class = ''
                    classHour.teacher = ''
                } else {
                    for (const subject of this.subjects) {
                        if(subject._id === catalogClassHours[day][hour].subjectID)
                        {
                            classHour.subject = subject.name
                        }
                    }
                    for (const clas of this.classes) {
                        if(clas._id === catalogClassHours[day][hour].classID)
                        {
                            classHour.class = clas.name
                        }
                    }
                    for (const teacher of this.teachers) {
                        if(teacher._id === catalogClassHours[day][hour].teacherID)
                        {
                            classHour.teacher = teacher.name
                        }
                    }
                }
                Vue.set(this.catalog[day], hour, classHour)
            }
          }
        },
        convertHourToInt(hour) {
            return parseInt(hour.substring(0, hour.indexOf('-'))) - 8;
        },
    },
}
  
</script>
 
 <style>
 .border{
  border: 1px solid black;
  border-collapse: collapse;
}
 </style>