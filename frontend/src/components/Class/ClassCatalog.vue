<template>
  <div app>
    <div class="classRoomLabel"> Class Room: <span class="locationLabelColor">{{ classRoom }} </span>
    </div>
    <v-data-table :items-per-page="-1" hide-default-footer :headers="headers" :items="items" class="border">
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
  </div>
</template>

<script setup lang="ts">
import type { TeacherData } from '@/modules/teacher/teacher.type';
import type { SubjectData } from '@/modules/subject/subject.type';
import type { LocationData } from '@/modules/location/location.type';
import type { ClassHourShowData } from '@/modules/classhour/classhour.type';

import { fetchClass } from '@/modules/class/class.api';
import { fetchLocations } from '@/modules/location/location.api';
import { fetchSubjects } from '@/modules/subject/subject.api';
import { fetchTeachers } from '@/modules/teacher/teacher.api';

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
  { hours: "15-16" }
])

const teachers = ref<TeacherData[]>([])
const locations = ref<LocationData[]>([])
const subjects = ref<SubjectData[]>([])
const classRoom = ref('')
const catalog = ref<Array<Array<ClassHourShowData | undefined>>>(Array(5).fill(null).map(() => Array(8).fill(undefined)));

onMounted(async () => {
  await fetchCatalog()
})

watch(() => props.id, async () => {
  await fetchCatalog();
});

const fetchCatalog = async() => {
  if (!props.id)
    return

  locations.value = await fetchLocations()
  subjects.value = await fetchSubjects()
  teachers.value = await fetchTeachers()

  const clas = await fetchClass(props.id)
  const catalogClassHours = clas.catalog  

  classRoom.value = clas.location
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
.locationLabelColor {
  color: #2b762e;
}

.classRoomLabel {
  margin-bottom: 25px;
  font-weight: bold;
}

.border {
  border: 1px solid black;
  border-collapse: collapse;
}
</style>