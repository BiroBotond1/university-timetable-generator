<template>
  <v-data-table app :items-per-page="-1" hide-default-footer :headers="headers" :items="items" class="border">
    <template v-slot:[`item.monday`]="{ item }">
      <ClassHour :hour="catalog[0][convertHourToInt(item.hours)]" />
    </template>
    <template v-slot:[`item.tuesday`]="{ item }">
      <ClassHour :hour="catalog[1][convertHourToInt(item.hours)]" />
    </template>
    <template v-slot:[`item.wednesday`]="{ item }">
      <ClassHour :hour="catalog[2][convertHourToInt(item.hours)]" />
    </template>
    <template v-slot:[`item.thursday`]="{ item }">
      <ClassHour :hour="catalog[3][convertHourToInt(item.hours)]" />
    </template>
    <template v-slot:[`item.friday`]="{ item }">
      <ClassHour :hour="catalog[4][convertHourToInt(item.hours)]" />
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import type { ClassHourShowData } from '@/modules/classhour/classhour.type';
import type { ClassData } from '@/modules/class/class.type';
import type { TeacherData } from '@/modules/teacher/teacher.type';
import type { SubjectData } from '@/modules/subject/subject.type';

import { fetchClasses } from '@/modules/class/class.api';
import { fetchSubjects } from '@/modules/subject/subject.api';
import { fetchTeachers } from '@/modules/teacher/teacher.api';
import { fetchLocation } from '@/modules/location/location.api';

const props = defineProps<{
  id: string | undefined
}>()

const headers = ref([
  { text: "Hours", value: "hours" },
  { text: "Monday", value: "monday" },
  { text: "Tuesday", value: "tuesday" },
  { text: "Wednesday", value: "wednesday" },
  { text: "Thursday", value: "thursday" },
  { text: "Friday", value: "friday" },
])
const items = ref([
  { hours: "8-9" },
  { hours: "9-10" },
  { hours: "10-11" },
  { hours: "11-12" },
  { hours: "12-13" },
  { hours: "13-14" },
  { hours: "14-15" },
  { hours: "15-16" },
])

const teachers = ref<TeacherData[]>([])
const subjects = ref<SubjectData[]>([])
const classes = ref<ClassData[]>([])
const catalog = ref<Array<Array<ClassHourShowData | undefined>>>(Array(5).fill(null).map(() => Array(8).fill(undefined)));

onMounted(async () => {
  await fetchCatalog()
})

watch(() => props.id, async () => {
  await fetchCatalog()
})

const fetchCatalog = async() => {
  if (!props.id)
    return 

  classes.value = await fetchClasses()
  subjects.value = await fetchSubjects()
  teachers.value = await fetchTeachers()

  const location = await fetchLocation(props.id)
  const catalogClassHours = location.catalog

  for (var day = 0; day < catalog.value.length; day++) {
    for (var hour = 0; hour < catalog.value[day].length; hour++) {
      let classHour = undefined as ClassHourShowData | undefined

      if (!catalogClassHours) {
        catalog.value[day][hour] = classHour
        continue
      }
     
      if (catalogClassHours[day][hour] === undefined) {
        catalog.value[day][hour] = classHour
        continue
      } 

      classHour = {
        class: undefined,
        subject: undefined,
        teacher: undefined,
        location: undefined
      }

      for (const subject of subjects.value) {
        if (subject._id === catalogClassHours[day][hour].subjectID) {
          classHour.subject = subject
        }
      }
      for (const clas of classes.value) {
        if (clas._id === catalogClassHours[day][hour].classID) {
          classHour.class = clas
        }
      }
      for (const teacher of teachers.value) {
        if (teacher._id === catalogClassHours[day][hour].teacherID) {
          classHour.teacher = teacher
        }
      }
      catalog.value[day][hour] = classHour
    }
  }
}

const convertHourToInt = (hour: string) => {
  return parseInt(hour.substring(0, hour.indexOf('-'))) - 8;
}
</script>

<style>
.border {
  border: 1px solid black;
  border-collapse: collapse;
}
</style>