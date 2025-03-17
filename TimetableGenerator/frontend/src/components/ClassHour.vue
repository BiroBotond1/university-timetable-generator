<template>
  <div app>
    <div v-if="props.hour">
      <div class="timetable-hour-title">
        <span class="subject">{{ props.hour.subject?.name }}</span>
      </div>
      <div class="timetable-hour-info">
        <span v-if="props.hour.teacher" class="teacher">{{ props.hour.teacher.name }}</span>
        <span v-if="props.hour.class" class="class">{{ props.hour.class.name }}</span>
        <span v-if="location" class="location">{{ location }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import type { ClassHourShowData } from '@/modules/classhour/classhour.type';

const props = defineProps<{
  hour : ClassHourShowData | undefined
}>()

const location = computed(() => {
  if (props.hour === undefined)
    return undefined
  
  if(props.hour.location)
    return props.hour.location.name

  if(props.hour.class) 
    return props.hour.class.location

  return undefined
})

</script>

<style scoped>
.timetable-hour-title {
  font-size: 0.9em;
  font-weight: bold;
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