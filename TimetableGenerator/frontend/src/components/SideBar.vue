<template>
  <div>
    <v-app-bar color="highlight" app clipped-left clipped-right flat dark>
      <v-toolbar-title> 
        <v-btn v-if="projectId" icon="mdi-home" @click="goHome"></v-btn>
        TimetableGenerator
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="projectId">
      <v-btn @click="importData()" class="py-2">Import</v-btn>
      <v-btn @click="exportData()">Export</v-btn>
      </template>
      <invitations-bell/>
      <user/>
      <v-progress-circular
        v-if="generating"
        :width="8"
        indeterminate
        color="white"
      ></v-progress-circular>
      <v-alert
        v-if="generationAlert"
        :color="ALERTS[generationAlert].color"
        :icon="ALERTS[generationAlert].icon"
        :closable="generationAlert !== 'success'"
        density="compact"
        @click:close="generationStore.dismissAlert()"
      >
        {{ ALERTS[generationAlert].text }}
        <v-btn v-if="generationAlert !== 'success'" variant="text" size="small" @click="openGenerate">
          Details
        </v-btn>
      </v-alert>
    </v-app-bar>

    <v-snackbar v-model="showFlash" timeout="5000" location="top right">
      {{ appStore.flash }}
    </v-snackbar>

    <v-navigation-drawer v-model:rail="isRail" color="highlight" expand-on-hover permanent dark>
      <div class="d-flex flex-column h-[100%]">
        <v-list density="compact" nav>
          <template v-if="projectId">
            <v-list-item 
              v-for="item in items"
              :key="item.title"
              link
              :to="item.route"
              :prepend-icon="item.icon"
              :title="item.title"
            >
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item
              v-for="item in catalogItems"
              :key="item.title"
              link
              :to="item.route"
              :disabled="generating"
              :prepend-icon="item.icon"
              :title="item.title"
            >
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item
              v-for="item in memberItems"
              :key="item.title"
              link
              :to="item.route"
              :prepend-icon="item.icon"
              :title="item.title"
            >
            </v-list-item>
          </template>
          <template v-else>
            
          </template>
        </v-list>
        <div class="mt-auto pa-2">
           <theme-toggle :showLabel="!isRail" />
        </div>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAppStore } from "@/modules/app/app.store";
import { useRoute, useRouter } from "vue-router";
import {
  emitDoImport,
  emitGetTimetableData,
  setupImportExportSocketListeners,
} from "@/modules/import-export/import-export.socket";
import { doImport } from "@/modules/import-export/import-export.service";
import { useInvitationStore } from "@/modules/project/invitation.store";
import { setupMembershipSocketListeners } from "@/modules/project/project.socket";
import { useGenerationStore, type GenerationAlert } from "@/modules/generation/generation.store";
import { setupGenerationSocketListeners } from "@/modules/generation/generation.socket";

const router = useRouter();
const route = useRoute();

const appStore = useAppStore()
const projectId = computed(() => appStore.projectId);

const generationStore = useGenerationStore()
const generating = computed(() => generationStore.generating);
const generationAlert = computed(() => generationStore.alert);

const ALERTS: Record<GenerationAlert, { color: string, icon: string, text: string }> = {
  success: { color: "primary", icon: "$success", text: "Generating is done!" },
  warning: { color: "warning", icon: "$warning", text: "Generated, but some hard constraints are not met." },
  failure: { color: "error", icon: "$error", text: "Generation failed." },
};

const invitationStore = useInvitationStore()

const showFlash = computed({
  get: () => !!appStore.flash,
  set: (visible) => { if (!visible) appStore.flash = null },
})

let teardownImportExport: (() => void) | null = null
let teardownMembership: (() => void) | null = null
let teardownGeneration: (() => void) | null = null

onMounted(() => {
  teardownImportExport = setupImportExportSocketListeners();

  // Here rather than on the Generate page, so a tab on any page of the project
  // follows a run and hears how it ended.
  teardownGeneration = setupGenerationSocketListeners({
    onRun: (run) => generationStore.apply(run),
    onStale: () => {
      if (appStore.projectId) generationStore.load()
    },
  });

  // Mounted for the whole session, so it hosts the membership listeners.
  teardownMembership = setupMembershipSocketListeners({
    onInvitationsChanged: ({ reason }) => {
      invitationStore.load()
      if (reason === 'received') {
        appStore.flash = 'You have been invited to a project.'
      }
    },

    onProjectsChanged: () => invitationStore.projectsChanged(),

    onProjectClosed: ({ projectId: closedId, reason }) => {
      invitationStore.projectsChanged()

      if (appStore.projectId === closedId) {
        appStore.flash = {
          deleted: 'This project was deleted by its owner.',
          removed: 'You were removed from this project.',
          left: 'You left the project.',
        }[reason] ?? 'You no longer have access to this project.'
        router.push({ name: "/" })
      }
    },
  });

  invitationStore.load()
});

// Load again after the sync: it can attach invitations sent before this user
// had an account.
watch(() => appStore.currentUser?._id, (id) => {
  if (id) invitationStore.load()
})

onUnmounted(() => {
  teardownImportExport?.()
  teardownMembership?.()
  teardownGeneration?.()
});

// Runs belong to one project; load them whenever another one is opened.
watch(() => appStore.projectId, (id) => {
  generationStore.clear()
  if (id) generationStore.load()
}, { immediate: true })

// The Generate page shows the run in full, so opening it counts as seeing a
// warning or a failure.
watch(() => route.name, (name) => {
  if (name === '/p/[projectId]/Generate') generationStore.dismissAlert()
})

const openGenerate = () => {
  router.push(`${base.value}/Generate`)
}

const base = computed(() => `/p/${projectId.value}`)

const items = computed(() => [
  { title: "Generate timetable", icon: "mdi-pencil", route: `${base.value}/Generate` },
  { title: "Locations", icon: "mdi-map-marker", route: `${base.value}/Locations` },
  { title: "Teachers", icon: "mdi-account-edit", route: `${base.value}/Teachers` },
  { title: "Subjects", icon: "mdi-book-variant", route: `${base.value}/Subjects` },
  { title: "Classes", icon: "mdi-account-group", route: `${base.value}/Classes` },
  { title: "ClassHours", icon: "mdi-clock-outline", route: `${base.value}/ClassHours` },
]);

const catalogItems = computed(() => [
  {
    title: "Class Catalogs",
    icon: "mdi-calendar-clock-outline",
    route: `${base.value}/ClassCatalogs`,
  },
  {
    title: "Teacher Catalogs",
    icon: "mdi-calendar-account-outline",
    route: `${base.value}/TeacherCatalogs`,
  },
  {
    title: "Location Catalogs",
    icon: "mdi-file-marker",
    route: `${base.value}/LocationCatalogs`,
  }
]);

const memberItems = computed(() => [
  { title: "Members", icon: "mdi-account-multiple", route: `${base.value}/Members` },
]);

const isRail = ref(true) 

function exportData(): void {
  emitGetTimetableData();
}

async function importData(): Promise<void> {
  const fileContent = await doImport();
  emitDoImport(fileContent);
}

const goHome = () => {
  router.push({ name: "/" })
}
</script>
