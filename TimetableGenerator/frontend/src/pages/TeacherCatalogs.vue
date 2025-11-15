<template>
  <div app>
    <v-navigation-drawer color="highlight" permanent location="right">
      <v-list dense nav>
        <v-list-item v-for="item in teachers" :key="item._id"
          :class="{ 'bg-selected-sidebar': item._id === teacherId }" @click="selectTeacher(item._id)"
          :title="item.name">
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <TeacherCatalog ref="teacherCatalogRef" v-model:id="teacherId"/>
    <ColorsLabel :show-teacher="false"/>
    <v-btn class="mt-2" color="primary" block @click="printComponent(teacherCatalogRef)">
      Print</v-btn>
  </div>
</template>

<script setup lang="ts">
import type { TeacherData } from '@/modules/teacher/teacher.type';
import { fetchTeachers } from '@/modules/teacher/teacher.api';
import { printComponent } from '@/modules/app/app.print';

const teachers = ref<TeacherData[]>([])
const teacherId = ref<string | undefined>()
const teacherCatalogRef = ref<ComponentPublicInstance | null>(null);

onMounted(async () => {
  teachers.value = await fetchTeachers()
  teachers.value = teachers.value.sort((a, b) => a.name.localeCompare(b.name))
  if (teachers.value.length > 0) {
    selectTeacher(teachers.value[0]._id)
  }
})

const selectTeacher = (id: string) => {
  teacherId.value = id
}
</script>