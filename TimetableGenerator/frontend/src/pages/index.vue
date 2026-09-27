<template>
  <v-container class="py-8" style="max-width: 900px">
    <div class="d-flex align-center mb-6">
      <h1 class="text-h5">Projects</h1>
      <v-spacer></v-spacer>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        New project
      </v-btn>
    </div>

    <v-alert v-if="error" type="error" class="mb-4" density="compact">
      {{ error }}
    </v-alert>

    <v-card v-if="invitationStore.count" class="mb-6" variant="tonal">
      <v-card-title class="text-subtitle-1">Invitations</v-card-title>
      <v-list>
        <v-list-item
          v-for="invitation in invitationStore.invitations"
          :key="invitation._id"
          :title="invitation.project?.name ?? 'Unnamed project'"
          :subtitle="`Invited by ${invitation.invitedBy?.username ?? invitation.invitedBy?.email ?? 'someone'}`"
        >
          <template #append>
            <v-btn
              size="small"
              variant="text"
              color="primary"
              @click="respond(invitation.project._id, true)"
            >
              Accept
            </v-btn>
            <v-btn
              size="small"
              variant="text"
              @click="respond(invitation.project._id, false)"
            >
              Decline
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>

    <v-card v-else-if="!projects.length" variant="tonal" class="pa-8 text-center">
      <div class="text-body-1 mb-2">No projects yet.</div>
      <div class="text-body-2 text-medium-emphasis">
        A project holds one school: its teachers, subjects, classes, rooms and
        timetable.
      </div>
    </v-card>

    <v-list v-else>
      <v-list-item
        v-for="project in projects"
        :key="project._id"
        class="mb-2"
        border
        rounded
        :title="project.name"
        :subtitle="project.role === 'owner' ? 'Owner' : 'Collaborator'"
        @click="openProject(project)"
      >
        <template #prepend>
          <v-icon icon="mdi-school-outline"></v-icon>
        </template>
        <template #append>
          <v-btn
            v-if="project.role === 'owner'"
            icon="mdi-delete"
            variant="text"
            size="small"
            @click.stop="confirmDelete(project)"
          ></v-btn>
        </template>
      </v-list-item>
    </v-list>

    <v-dialog v-model="createDialog" max-width="480">
      <v-card>
        <v-card-title>New project</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newName"
            label="Project name"
            autofocus
            @keyup.enter="submitCreate"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="createDialog = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!newName.trim()" @click="submitCreate">
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="520">
      <v-card>
        <v-card-title>Delete project</v-card-title>
        <v-card-text>
          <p class="mb-4">
            This permanently deletes <strong>{{ projectToDelete?.name }}</strong>
            and everything in it. Type the project name to confirm.
          </p>
          <v-text-field
            v-model="deleteConfirmation"
            label="Project name"
            autofocus
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="deleteDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            :disabled="deleteConfirmation !== projectToDelete?.name"
            @click="submitDelete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import {
  createProject,
  deleteProject,
  fetchProjects
} from "@/modules/project/project.api";
import { useInvitationStore } from "@/modules/project/invitation.store";
import type { ProjectData } from "@/modules/project/project.type";

const router = useRouter();

const invitationStore = useInvitationStore()

const projects = ref<ProjectData[]>([])
const loading = ref(true)
const error = ref('')

const createDialog = ref(false)
const newName = ref('')

const deleteDialog = ref(false)
const deleteConfirmation = ref('')
const projectToDelete = ref<ProjectData | null>(null)

const load = async () => {
  loading.value = true
  error.value = ''

  try {
    projects.value = await fetchProjects()
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await load()
});

watch(() => invitationStore.projectsVersion, () => load())

const openProject = (project: ProjectData) => {
  // The route guard joins the project from the URL.
  router.push(`/p/${project._id}/Generate`)
}

const openCreateDialog = () => {
  newName.value = ''
  createDialog.value = true
}

const submitCreate = async () => {
  if (!newName.value.trim()) return

  try {
    const project = await createProject(newName.value.trim())
    createDialog.value = false
    await load()
    openProject(project)
  } catch (err) {
    error.value = (err as Error).message
  }
}

const confirmDelete = (project: ProjectData) => {
  projectToDelete.value = project
  deleteConfirmation.value = ''
  deleteDialog.value = true
}

const submitDelete = async () => {
  if (!projectToDelete.value) return

  try {
    await deleteProject(projectToDelete.value._id)
    deleteDialog.value = false
    await load()
  } catch (err) {
    error.value = (err as Error).message
  }
}

const respond = async (projectId: string, accept: boolean) => {
  try {
    await invitationStore.respond(projectId, accept)
  } catch (err) {
    error.value = (err as Error).message
  }
}
</script>
