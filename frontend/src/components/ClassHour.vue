<template>
    <div app>
        <br>
        <v-row app v-if="hour.subject" class="d-flex">
            <label> {{ hour.subject }} </label>
        </v-row>

        <v-row app v-if="hour.teacher" class="d-flex">
            <label> {{ hour.teacher }} </label>
        </v-row> 

        <v-row app v-if="hour.location" class="d-flex">
            <label> {{ hour.location }} </label>
        </v-row> 

        <v-row app v-if="hour.class" class="d-flex">
            <label> {{ hour.class }} </label>
        </v-row> 
        <br>
    </div>
 </template>
 
 <script>
 export default {
    props: ['hour'],
    data () {
      return {
      }
    },
  }

</script>
 
 <style>
 </style>