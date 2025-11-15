<template>
  <div app>
    <div class="font-bold mb-5">
      Class Room: <span class="text-location">{{ classRoom }} </span>
    </div>
    <CatalogDataTable :catalog="catalog" />
  </div>
</template>

<script setup lang="ts">
import type { TeacherData } from "@/modules/teacher/teacher.type";
import type { SubjectData } from "@/modules/subject/subject.type";
import type { LocationData } from "@/modules/location/location.type";
import type { ClassHourShowData } from "@/modules/classhour/classhour.type";

import { fetchClass } from "@/modules/class/class.api";
import { fetchLocations } from "@/modules/location/location.api";
import { fetchSubjects } from "@/modules/subject/subject.api";
import { fetchTeachers } from "@/modules/teacher/teacher.api";

const props = defineProps<{
  id: string | undefined;
}>();

const teachers = ref<TeacherData[]>([]);
const locations = ref<LocationData[]>([]);
const subjects = ref<SubjectData[]>([]);
const classRoom = ref("");
const catalog = ref<Array<Array<ClassHourShowData | undefined>>>(
  Array(5)
    .fill(null)
    .map(() => Array(8).fill(undefined))
);

onMounted(async () => {
  await fetchCatalog();
});

watch(
  () => props.id,
  async () => {
    await fetchCatalog();
  }
);

const fetchCatalog = async () => {
  if (!props.id) return;

  locations.value = await fetchLocations();
  subjects.value = await fetchSubjects();
  teachers.value = await fetchTeachers();

  const clas = await fetchClass(props.id);
  const catalogClassHours = clas.catalog;

  classRoom.value = clas.location;
  for (var day = 0; day < catalog.value.length; day++) {
    for (var hour = 0; hour < catalog.value[day].length; hour++) {
      let classHour = undefined as ClassHourShowData | undefined;

      if (!catalogClassHours) {
        catalog.value[day][hour] = classHour;
        continue;
      }

      if (catalogClassHours[day][hour] === undefined) {
        catalog.value[day][hour] = classHour;
        continue;
      }

      classHour = {
        class: undefined,
        subject: undefined,
        teacher: undefined,
        location: undefined,
      };

      for (const subject of subjects.value) {
        if (subject._id === catalogClassHours[day][hour].subjectID) {
          classHour.subject = subject;
        }
      }
      for (const location of locations.value) {
        if (location._id === catalogClassHours[day][hour].locationID) {
          classHour.location = location;
        }
      }
      for (const teacher of teachers.value) {
        if (teacher._id === catalogClassHours[day][hour].teacherID) {
          classHour.teacher = teacher;
        }
      }
      catalog.value[day][hour] = classHour;
    }
  }
};
</script>