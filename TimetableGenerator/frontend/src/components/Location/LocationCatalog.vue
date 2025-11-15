<template>
  <CatalogDataTable :catalog="catalog"/>
</template>

<script setup lang="ts">
import type { ClassHourShowData } from "@/modules/classhour/classhour.type";
import type { ClassData } from "@/modules/class/class.type";
import type { TeacherData } from "@/modules/teacher/teacher.type";
import type { SubjectData } from "@/modules/subject/subject.type";

import { fetchClasses } from "@/modules/class/class.api";
import { fetchSubjects } from "@/modules/subject/subject.api";
import { fetchTeachers } from "@/modules/teacher/teacher.api";
import { fetchLocation } from "@/modules/location/location.api";

const props = defineProps<{
  id: string | undefined;
}>();

const teachers = ref<TeacherData[]>([]);
const subjects = ref<SubjectData[]>([]);
const classes = ref<ClassData[]>([]);
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

  classes.value = await fetchClasses();
  subjects.value = await fetchSubjects();
  teachers.value = await fetchTeachers();

  const location = await fetchLocation(props.id);
  const catalogClassHours = location.catalog;

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
      for (const clas of classes.value) {
        if (clas._id === catalogClassHours[day][hour].classID) {
          classHour.class = clas;
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
