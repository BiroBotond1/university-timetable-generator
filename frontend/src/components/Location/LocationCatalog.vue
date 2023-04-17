
<template>
    <v-data-table app
    :items-per-page="-1"
    hide-default-footer
    :headers="headers"
    :items="items"
    class="border">
        <template v-slot:[`item.monday`]="{ item }"> 
            <v-label>
                {{ catalog[0][convertHourToInt(item.hours)] }}
            </v-label>
        </template>
        <template v-slot:[`item.tuesday`]="{ item }"> 
            <v-label>
                {{ catalog[1][convertHourToInt(item.hours)] }}
            </v-label>
        </template>
        <template v-slot:[`item.wednesday`]="{ item }"> 
            <v-label>
                {{ catalog[2][convertHourToInt(item.hours)] }}
            </v-label>
        </template>
        <template v-slot:[`item.thursday`]="{ item }"> 
            <v-label>
                {{ catalog[3][convertHourToInt(item.hours)] }}
            </v-label>
        </template>
        <template v-slot:[`item.friday`]="{ item }"> 
            <v-label>
                {{ catalog[4][convertHourToInt(item.hours)] }}
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
        locationID: '',
        catalog:
           [["", "", "", "", "", "", "", ""],
           ["", "", "", "", "", "", "", ""],
           ["", "", "", "", "", "", "", ""],
           ["", "", "", "", "", "", "", ""],
           ["", "", "", "", "", "", "", ""]],
        active: true,
        classHour: {}
      }
    },

    async created () {
      await this.fetchCatalog()
    },

    watch: {
    async locationID() {
       await this.fetchCatalog()
    }
  },

    methods: {
        async fetchClassHour(id) {
          let response = await axios.
          get('http://127.0.0.1:3000/api/classHour/' + id)
          .catch(error => console.log(error))
          this.classHour = response.data.data
        },
        async fetchCatalog() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/location/' + this.locationID)
          .catch(error => console.log(error))
          let catalogIDs = response.data.data.catalog
          for(var day = 0; day < this.catalog.length; day++)
          {
            for(var hour = 0; hour < this.catalog[day].length; hour++) {
                if(!catalogIDs) {
                    Vue.set(this.catalog[day], hour, '')
                    continue
                }
                if(catalogIDs[day][hour] === '') {
                    Vue.set(this.catalog[day], hour, '')
                } else {
                    await this.fetchClassHour(catalogIDs[day][hour])
                    Vue.set(this.catalog[day], hour, this.classHour.subject.name)
                }
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