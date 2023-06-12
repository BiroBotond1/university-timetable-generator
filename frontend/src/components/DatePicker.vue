
<template>
    <v-data-table
    :items-per-page="-1"
    hide-default-footer
    :headers="headers"
    :items="items"
    class="border">
        <template v-slot:[`item.monday`]="{ item }"> 
            <v-btn
            class="white--text hourButton"
            @click="chooseItem(0, convertHourToInt(item.hours))" 
            v-bind:color="dates[0][convertHourToInt(item.hours)] === 0 ? 'green':'red' " 
            > {{ GetButtonText(0 , item.hours) }}
        </v-btn>
        </template>
        <template v-slot:[`item.tuesday`]="{ item }"> 
            <v-btn
            class="white--text hourButton"
            @click="chooseItem(1, convertHourToInt(item.hours))"
            v-bind:color="dates[1][convertHourToInt(item.hours)] === 0 ? 'green':'red' " 
        >  {{ GetButtonText(1 , item.hours) }}
            </v-btn>
        </template>
        <template v-slot:[`item.wednesday`]="{ item }"> 
            <v-btn
            class="white--text hourButton"
            @click="chooseItem(2, convertHourToInt(item.hours))" 
            v-bind:color="dates[2][convertHourToInt(item.hours)] === 0 ? 'green':'red' " 
        >   {{ GetButtonText(2 , item.hours) }}
            </v-btn>
        </template>
        <template v-slot:[`item.thursday`]="{ item }"> 
            <v-btn
            class="white--text hourButton"
            @click="chooseItem(3, convertHourToInt(item.hours))" 
            v-bind:color="dates[3][convertHourToInt(item.hours)] === 0 ? 'green':'red' " 
        >   {{ GetButtonText(3 , item.hours) }}
            </v-btn>
        </template>
        <template v-slot:[`item.friday`]="{ item }"> 
            <v-btn
            class="white--text hourButton"
            @click="chooseItem(4, convertHourToInt(item.hours))" 
            v-bind:color="dates[4][convertHourToInt(item.hours)] === 0 ? 'green':'red' " 
        >   {{ GetButtonText(4 , item.hours) }}
            </v-btn>
        </template>
    </v-data-table>
 </template>
 
 <script>
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
        dates: [
           [0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        active: true
      }
    },

    methods: {
        convertHourToInt(hour) {
            return parseInt(hour.substring(0, hour.indexOf('-'))) - 8;
        },
        chooseItem (day, hour) {
            if( this.dates[day][hour] === 0)
            {
                Vue.set(this.dates[day], hour, -1);
            } else {
                Vue.set(this.dates[day], hour, 0);
            }
      },
      GetButtonText(index, hours) {
        return this.dates[index][this.convertHourToInt(hours)] === 0 ? "Free" : "Occupied";
      }
    },
}
  
</script>
 
 <style>
.hourButton {
    width: 100px
}

 .border{
  border: 1px solid black;
  border-collapse: collapse;
}
 </style>