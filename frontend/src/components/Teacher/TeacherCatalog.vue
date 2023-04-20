
<template>
    <v-data-table app
    :items-per-page="-1"
    hide-default-footer
    :headers="headers"
    :items="items"
    class="border">
        <template v-slot:[`item.monday`]="{ item }"> 
            <v-label>
                {{ catalog[0][convertHourToInt(item.hours)].subject }}
            </v-label>
        </template>
        <template v-slot:[`item.tuesday`]="{ item }"> 
            <v-label>
                {{ catalog[1][convertHourToInt(item.hours)].subject }}
            </v-label>
        </template>
        <template v-slot:[`item.wednesday`]="{ item }"> 
            <v-label>
                {{ catalog[2][convertHourToInt(item.hours)].subject }}
            </v-label>
        </template>
        <template v-slot:[`item.thursday`]="{ item }"> 
            <v-label>
                {{ catalog[3][convertHourToInt(item.hours)].subject }}
            </v-label>
        </template>
        <template v-slot:[`item.friday`]="{ item }"> 
            <v-label>
                {{ catalog[4][convertHourToInt(item.hours)].subject }}
            </v-label>
        </template>
    </v-data-table>
 </template>
 
 <script>
import axios from 'axios'
import Vue from 'vue'
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
        teacherID: '',
        locations: [],
        classes: [],
        subjects: [],
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

    watch: {
    async teacherID() {
       await this.fetchCatalog()
    }
  },

    methods: {
        async fetchSubjects() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/subject')
          .catch(error => console.log(error))
          this.subjects = response.data.data
        },
        async fetchLocations() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/location')
          .catch(error => console.log(error))
          this.locations = response.data.data
        },
        async fetchClasses() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/class')
          .catch(error => console.log(error))
          this.classes = response.data.data
        },
        async fetchCatalog() {
          await this.fetchLocations();
          await this.fetchSubjects();
          await this.fetchClasses();
          let response = await axios.
          get('http://127.0.0.1:3000/api/teacher/' + this.teacherID)
          .catch(error => console.log(error))
          let catalogClassHours = response.data.data.catalog
          for(var day = 0; day < this.catalog.length; day++)
          {
            for(var hour = 0; hour < this.catalog[day].length; hour++) {
                let classHour = {}
                if(!catalogClassHours) {
                    classHour.subject = ''
                    classHour.location = ''
                    classHour.class = ''
                    Vue.set(this.catalog[day], hour, classHour)
                    continue
                } 
                if (catalogClassHours[day][hour] === '') {
                    classHour.subject = ''
                    classHour.location = ''
                    classHour.class = ''
                }else {
                    for (const subject of this.subjects) {
                        if(subject._id === catalogClassHours[day][hour].subjectID)
                        {
                            classHour.subject = subject.name
                        }
                    }
                    for (const location of this.locations) {
                        if(location._id === catalogClassHours[day][hour].locationID)
                        {
                            classHour.location = location.name
                        }
                    }
                    for (const clas of this.classes) {
                        if(clas._id === catalogClassHours[day][hour].classID)
                        {
                            classHour.class = clas.name
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