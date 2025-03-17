<template>
  <div app>
    <v-navigation-drawer color="#1D0C59" permanent dark location="right">
      <v-list dense nav>
        <v-list-item v-for="item in teachers" :key="item._id"
          :class="{ active: item._id === teacherId }" @click="selectTeacher(item._id)"
          :title="item.name">
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <TeacherCatalog ref="teacherCatalogRef" v-model:id="teacherId"/>
    <div class="color-container">
      <div class="color-box subjectColor"></div>
      <div class="color-label">Subject</div>
      <div class="color-box classColor"></div>
      <div class="color-label">Class</div>
      <div class="color-box locationColor"></div>
      <div class="color-label">Location</div>
    </div>
    <br />
    <v-btn class="white--text" color="#1E88E5" block @click="printComponent(teacherCatalogRef)">
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
  if (teachers.value.length > 0) {
    selectTeacher(teachers.value[0]._id)
  }
})

const selectTeacher = (id: string) => {
  teacherId.value = id
}
</script>

<style>
.subjectColor {
  background-color: #000000;
}

.classColor {
  background-color: #ff2b2bba;
}

.locationColor {
  background-color: #2b762e;
}

.active {
  background: rgb(105, 105, 105);
}

.color-container {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.color-box {
  width: 18px;
  height: 18px;
  margin: 2px;
}

.color-label {
  margin-top: 2px;
  text-align: center;
  margin-right: 15px;
}
</style>
