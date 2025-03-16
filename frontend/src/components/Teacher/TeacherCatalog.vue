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
import type{ SubjectData } from '@/modules/subject/subject.type';
import type { LocationData } from '@/modules/location/location.type';
import type { ClassData } from '@/modules/class/class.type';

import { fetchLocations } from '@/modules/location/location.api';
import { fetchClasses } from '@/modules/class/class.api';
import { fetchSubjects } from '@/modules/subject/subject.api';
import { fetchTeacher } from '@/modules/teacher/teacher.api';

const props = defineProps<{
  id: string | undefined
}>()

const headers = ref([
  { title: "Hours", key: "hours" },
  { title: "Monday", key: "monday" },
  { title: "Tuesday", key: "tuesday" },
  { title: "Wednesday", key: "wednesday" },
  { title: "Thursday", key: "thursday" },
  { title: "Friday", key: "friday" },
])
const items = ref([
  { hours: "8-9" },
  { hours: "9-10" },
  { hours: "10-11" },
  { hours: "11-12" },
  { hours: "12-13" },
  { hours: "13-14" },
  { hours: "14-15" },
  { hours: "15-16" }
])

const locations = ref<LocationData[]>([])
const classes = ref<ClassData[]>([])
const subjects = ref<SubjectData[]>([])
const catalog = ref<Array<Array<ClassHourShowData | undefined>>>(Array(5).fill(null).map(() => Array(8).fill(undefined)));

onMounted(async () => {
  await fetchCatalog()
})

watch(() => props.id, async () => {
  await fetchCatalog()
})

const fetchCatalog = async () => {
  if (!props.id)
    return 

  locations.value = await fetchLocations()
  subjects.value = await fetchSubjects()
  classes.value = await fetchClasses()
 
  const teacher = await fetchTeacher(props.id)
  let catalogClassHours = teacher.catalog

  for (var day = 0; day < catalog.value.length; day++) {
    for (var hour = 0; hour < catalog.value[day].length; hour++) {
      let classHour = undefined as ClassHourShowData | undefined

      if (!catalogClassHours) {
        catalog.value[day][hour] = classHour
        continue
      }

      if (catalogClassHours[day][hour] === undefined) {
        catalog.value[day][hour] = classHour
        continue;
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
      for (const location of locations.value) {
        if (location._id === catalogClassHours[day][hour].locationID) {
          classHour.location = location
        }
      }
      for (const clas of classes.value) {
        if (clas._id === catalogClassHours[day][hour].classID) {
          classHour.class = clas

          // if (classHour.location === undefined) {
          //   classHour.location = clas
          // }
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