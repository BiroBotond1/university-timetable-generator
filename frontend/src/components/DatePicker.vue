
<template>
    <v-data-table
    :items-per-page="-1"
    hide-default-footer
    :headers="headers"
    :items="items"
    class="border">
        <template v-slot:[`item.monday`]="{ item }"> 
            <v-btn
            @click="chooseItem(item.hours, 0)" 
            v-bind:color="dates[item.hours][0] === 0 ? 'green':'red' " 
            >
        </v-btn>
        </template>
        <template v-slot:[`item.tuesday`]="{ item }"> 
            <v-btn
            @click="chooseItem(item.hours, 1)"
            v-bind:color="dates[item.hours][1] === 0 ? 'green':'red' " 
        >   
            </v-btn>
        </template>
        <template v-slot:[`item.wednesday`]="{ item }"> 
            <v-btn
            @click="chooseItem(item.hours, 2)" 
            v-bind:color="dates[item.hours][2] === 0 ? 'green':'red' " 
        >   
            </v-btn>
        </template>
        <template v-slot:[`item.thursday`]="{ item }"> 
            <v-btn
            @click="chooseItem(item.hours, 3)" 
            v-bind:color="dates[item.hours][3] === 0 ? 'green':'red' " 
        >   
            </v-btn>
        </template>
        <template v-slot:[`item.friday`]="{ item }"> 
            <v-btn
            @click="chooseItem(item.hours, 4)" 
            v-bind:color="dates[item.hours][4] === 0 ? 'green':'red' " 
        >   
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
            {hours: "12-13"},
            {hours: "13-14"},
            {hours: "14-15"},
            {hours: "15-16"}
        ],
        dates: {
            "8-9": [0, 0, 0, 0, 0],
            "9-10": [0, 0, 0, 0, 0],
            "10-11": [0, 0, 0, 0, 0],
            "11-12": [0, 0, 0, 0, 0],
            "12-13": [0, 0, 0, 0, 0],
            "13-14": [0, 0, 0, 0, 0],
            "14-15": [0, 0, 0, 0, 0],
            "15-16": [0, 0, 0, 0, 0]
        },
        active: true
      }
    },

    methods: {
        chooseItem (hour, day) {
            if( this.dates[hour][day] === 0)
            {
                Vue.set(this.dates[hour], day, -1);
            } else {
                Vue.set(this.dates[hour], day, 0);
            }
      },
    },
}
  
</script>
 
 <style>
 .border{
  border: 1px solid black;
  border-collapse: collapse;
}

.hourButton {
    width: 25px;
    height: 20px;
}
 </style>