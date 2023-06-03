<template>
    <div app>
        <div class="timetable-hour-title">
        <span class="subject">{{ hour.subject }}</span>
        </div>
        <div class="timetable-hour-info">
        <span v-if="hour.teacher" class="teacher" >{{ hour.teacher }}</span>
        <span v-if="hour.class" class="class">{{ hour.class }}</span>
        <span v-if="hour.location" class="location">{{ hour.location }}</span> 
        </div>
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

  <style scoped>
  
  .timetable-hour-title {
    font-size: 0.9em;
  }
  
  .timetable-hour-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 2px;
    font-size: 0.8em;
    font-weight: bold;
  }
  
  .subject {
    color: #000000;
  }

  .teacher {
    color: #443dafb5;
  }
  
  .class {
    color: #ff2b2bba;
  }
  .location {
    color: #2b762e;
  }
  </style>