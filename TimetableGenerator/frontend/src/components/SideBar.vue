<template>
  <div>
    <v-app-bar color="highlight" app clipped-left clipped-right flat dark>
      <v-toolbar-title>TimetableGenerator</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click="importData()" class="py-2">Import</v-btn>
      <v-btn @click="exportData()">Export</v-btn>
      <v-btn @click="logout">Logout</v-btn>
      <v-progress-circular v-if="generating" :width="8" indeterminate color="white"></v-progress-circular>
      <v-alert v-if="notification" color="primary" icon="$success" density="compact">
        Generating is done!
      </v-alert>
    </v-app-bar>

    <v-navigation-drawer
      color="highlight"
      expand-on-hover
      rail
      permanent
      dark
    >
      <v-list density="compact" nav>
        <v-list-item v-for="item in items" :key="item.title"
         link :to="item.route" :prepend-icon="item.icon" :title="item.title">
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item v-for="item in catalogItems" :key="item.title" 
        link :to="item.route" :disabled="generating" :prepend-icon="item.icon" :title="item.title">
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item link to="/summary" :disabled="generating"
        prepend-icon="mdi-chart-line" title="Summary">
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAppStore } from "@/modules/app/app.store";
import { useRouter } from "vue-router";
import { emitDoImport, emitGetTimetableData, setupImportExportSocketListeners } from "@/modules/import-export/import-export.socket"
import { doImport } from "@/modules/import-export/import-export.service"; 
onMounted(async () => {
  setupImportExportSocketListeners(router)
})

const items = ref([
  { title: "Generate timetable", icon: "mdi-pencil", route: "/" },
  { title: "Locations", icon: "mdi-map-marker", route: "/locations" },
  { title: "Teachers", icon: "mdi-account-edit", route: "/teachers" },
  { title: "Subjects", icon: "mdi-book-variant", route: "/subjects" },
  { title: "Classes", icon: "mdi-account-group", route: "/classes" },
  { title: "ClassHours", icon: "mdi-clock-outline", route: "/classHours" },
]);

const catalogItems = ref([
  { title: "Class Catalogs", icon: "mdi-calendar-clock-outline", route: "/classCatalogs" },
  { title: "Teacher Catalogs", icon: "mdi-calendar-account-outline", route: "/teacherCatalogs" },
  { title: "Location Catalogs", icon: "mdi-file-marker", route: "/locationCatalogs" },
]);

const router = useRouter();

const generating = computed(() => useAppStore().generating);
const notification = computed(() => useAppStore().notification);

function logout(): void {
  localStorage.removeItem("token");
  router.push("/login");
}

function exportData(): void {
  emitGetTimetableData()
}

async function importData(): Promise<void> {
  const fileContent = await doImport()
  emitDoImport(fileContent)
}
</script>

<style scoped>
/* Prevent text jumping by keeping a fixed max-width */
.text {
  display: inline-block;
  max-width: 150px; /* Fixed width so it doesn’t stretch */
  overflow: hidden;
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
}
</style>
