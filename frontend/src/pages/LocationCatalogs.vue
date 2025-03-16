<template>
  <div app>
    <v-navigation-drawer color="#1D0C59" permanent dark location="right">
      <v-list dense nav>
        <v-list-item v-for="item in locations" :key="item._id"
          :class="{ active: item._id === locationId }" @click="selectLocation(item._id)"
          :title="item.name">
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <LocationCatalog v-model:id="locationId"/>
    <div class="color-container">
      <div class="color-box subjectColor"></div>
      <div class="color-label">Subject</div>
      <div class="color-box classColor"></div>
      <div class="color-label">Class</div>
      <div class="color-box teacherColor"></div>
      <div class="color-label">Teacher</div>
    </div>
    <br>
    <v-btn class="white--text" color="#1E88E5" block @click="print"> Print</v-btn>
  </div>
</template>

<script setup lang="ts">
import type { LocationData } from '@/modules/location/location.type';
import { fetchLocations } from '@/modules/location/location.api';

const locations = ref<LocationData[]>([])
const locationId = ref<string | undefined>()

onMounted(async () => {
  locations.value = await fetchLocations()
  if (locations.value.length > 0) {
    selectLocation(locations.value[0]._id)
  }
})

const selectLocation = (id: string) => {
  locationId.value = id
}

const print = () => {
  // const prtHtml = document.getElementById('locationCatalog').innerHTML;
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

.classColor {
  background-color: #ff2b2bba;
}

.teacherColor {
  background-color: #443dafb5;
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