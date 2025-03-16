<template>
  <div app>
    <v-navigation-drawer color="#1D0C59" app permanent clipped dark right>
      <v-list dense nav>
        <v-list-item v-for="item in classes" :key="item._id"
          :class="{ active: item._id === classId }" @click="selectClass(item._id)">
            <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <ClassCatalog v-model:id="classId"/>
    <div class="color-container">
      <div class="color-box subjectColor"></div>
      <div class="color-label">Subject</div>
      <div class="color-box teacherColor"></div>
      <div class="color-label">Teacher</div>
      <div class="color-box locationColor"></div>
      <div class="color-label">Location</div>
    </div>
    <br>
    <v-btn class="white--text" color="#1E88E5" block @click="print"> Print</v-btn>
  </div>
</template>


<script setup lang="ts">
import type { ClassData } from '@/modules/class/class.type';

import { fetchClasses } from '@/modules/class/class.api';

const classes = ref<ClassData[]>([])
const classId = ref<string | undefined>()

onMounted(async () => {
  classes.value = await fetchClasses()
  if (classes.value.length > 0) {
    selectClass(classes.value[0]._id)
  }
})

const selectClass = (id: string) => {
  classId.value = id
}

const print = () => {
  // const prtHtml = document.getElementById('classCatalog').innerHTML;
  // let stylesHtml = '';
  // for (const node of [...document.querySelectorAll('link[rel="stylesheet"], style')]) {
  //   stylesHtml += node.outerHTML;
  // }
  // const WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
  // WinPrint.document.write(`<!DOCTYPE html>
  //     <html>
  //       <head>
  //         ${stylesHtml}
  //       </head>
  //       <body>
  //         ${prtHtml}
  //       </body>
  //     </html>`);

  // WinPrint.document.close();
  // WinPrint.focus();
  // WinPrint.print();
  // WinPrint.close();
}
</script>


<style>
.subjectColor {
  background-color: #000000;
}

.teacherColor {
  background-color: #443dafb5;
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