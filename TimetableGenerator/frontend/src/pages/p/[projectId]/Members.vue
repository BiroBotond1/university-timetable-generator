<template>
  <v-container style="max-width: 900px">
    <div class="d-flex align-center mb-4">
      <h1 class="text-h5">Members</h1>
      <v-spacer></v-spacer>
      <v-chip v-if="role" size="small" :prepend-icon="isOwner ? 'mdi-crown' : 'mdi-account'">
        {{ isOwner ? 'You own this project' : 'You are a collaborator' }}
      </v-chip>
    </div>

    <v-alert
      v-if="error"
      type="error"
      density="compact"
      class="mb-4"
      closable
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <v-card v-if="isOwner" class="mb-6" variant="outlined">
      <v-card-title class="text-subtitle-1">Invite a collaborator</v-card-title>
      <v-card-text>
        <v-form class="d-flex align-start ga-2" @submit.prevent="submitInvite">
          <v-text-field
            v-model="email"
            label="Email address"
            type="email"
            density="compact"
            :rules="[emailRule]"
            hide-details="auto"
          ></v-text-field>
          <v-btn
            type="submit"
            color="primary"
            height="40"
            :loading="inviting"
            :disabled="!isValidEmail"
          >
            Invite
          </v-btn>
        </v-form>
        <p class="text-caption text-medium-emphasis mt-3 mb-0">
          Collaborators can edit everything and run generation. Only you can
          invite people, remove them, or delete the project. Someone without an
          account yet sees the invitation the first time they sign in.
        </p>
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>

    <template v-else>
      <h2 class="text-subtitle-1 font-weight-medium mb-2">Owner</h2>
      <v-list class="mb-6" border rounded>
        <v-list-item
          v-if="owner"
          :title="nameOf(owner)"
          :subtitle="emailOf(owner)"
          prepend-icon="mdi-crown"
        >
          <template #append>
            <v-chip v-if="isMe(owner)" size="x-small">you</v-chip>
          </template>
        </v-list-item>
      </v-list>

      <h2 class="text-subtitle-1 font-weight-medium mb-2">
        Collaborators ({{ collaborators.length }})
      </h2>
      <v-card
        v-if="!collaborators.length"
        variant="tonal"
        class="pa-4 mb-6 text-body-2 text-medium-emphasis"
      >
        {{ isOwner ? 'Nobody else is on this project yet. Invite someone above.' : 'No other collaborators yet.' }}
      </v-card>
      <v-list v-else class="mb-6" border rounded>
        <v-list-item
          v-for="member in collaborators"
          :key="member._id"
          :title="nameOf(member)"
          :subtitle="emailOf(member)"
          prepend-icon="mdi-account"
        >
          <template #append>
            <v-chip v-if="isMe(member)" size="x-small" class="mr-2">you</v-chip>
            <v-btn
              v-if="isOwner"
              icon="mdi-crown-outline"
              variant="text"
              size="small"
              :aria-label="`Make ${nameOf(member)} the owner`"
              @click="confirmTransfer(member)"
            ></v-btn>
            <v-btn
              v-if="isOwner"
              icon="mdi-account-remove"
              variant="text"
              size="small"
              :aria-label="`Remove ${nameOf(member)}`"
              @click="confirmRemove(member)"
            ></v-btn>
          </template>
        </v-list-item>
      </v-list>

      <template v-if="isOwner && pending.length">
        <h2 class="text-subtitle-1 font-weight-medium mb-2">
          Pending invitations ({{ pending.length }})
        </h2>
        <v-list border rounded>
          <v-list-item
            v-for="member in pending"
            :key="member._id"
            :title="member.email ?? emailOf(member)"
            :subtitle="member.user ? 'Waiting for an answer' : 'No account yet — sees it on first sign-in'"
            prepend-icon="mdi-email-outline"
          >
            <template #append>
              <v-btn
                size="small"
                variant="text"
                :loading="revoking === member._id"
                @click="revoke(member)"
              >
                Withdraw
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </template>
    </template>

    <v-card v-if="role" class="mt-8" variant="outlined">
      <v-card-title class="text-subtitle-1">Leave this project</v-card-title>
      <v-card-text class="d-flex align-center ga-4">
        <span class="text-body-2 text-medium-emphasis">
          {{ isOwner
            ? 'As the owner you cannot leave. Make a collaborator the owner first, using the crown next to their name.'
            : 'You will lose access immediately. The owner can invite you again later.' }}
        </span>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          variant="tonal"
          :disabled="isOwner"
          @click="leaveDialog = true"
        >
          Leave
        </v-btn>
      </v-card-text>
    </v-card>

    <v-dialog v-model="transferDialog" max-width="480">
      <v-card>
        <v-card-title>Transfer ownership</v-card-title>
        <v-card-text>
          <p class="mb-3">
            Make <strong>{{ memberToPromote ? nameOf(memberToPromote) : '' }}</strong>
            the owner of <strong>{{ projectName }}</strong>?
          </p>
          <p class="mb-0 text-body-2">
            You will become a collaborator. They will be able to invite and
            remove members &mdash; including you &mdash; and delete the
            project. Only they can give ownership back.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="transferDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="transferring" @click="submitTransfer">
            Transfer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="leaveDialog" max-width="460">
      <v-card>
        <v-card-title>Leave project</v-card-title>
        <v-card-text>
          Leave <strong>{{ projectName }}</strong>? You will lose access
          immediately, on every tab you have it open in.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="leaveDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="leaving" @click="submitLeave">Leave</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="removeDialog" max-width="460">
      <v-card>
        <v-card-title>Remove collaborator</v-card-title>
        <v-card-text>
          <strong>{{ memberToRemove ? nameOf(memberToRemove) : '' }}</strong>
          will lose access to this project immediately, including on any tab
          they have open. You can invite them again later.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="removeDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="removing" @click="submitRemove">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/modules/app/app.store'
import {
  fetchMembers,
  fetchProject,
  inviteMember,
  leaveProject,
  removeMember,
  revokeInvitation,
  transferOwnership
} from '@/modules/project/project.api'
import { setupMembersSocketListeners } from '@/modules/project/project.socket'
import type { ProjectMemberData, ProjectRole } from '@/modules/project/project.type'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const projectId = computed(() => (route.params as { projectId?: string }).projectId ?? '')

const members = ref<ProjectMemberData[]>([])
const role = ref<ProjectRole | null>(null)
const projectName = ref('')
const loading = ref(true)
const error = ref('')

const email = ref('')
const inviting = ref(false)
const revoking = ref<string | null>(null)

const removeDialog = ref(false)
const removing = ref(false)
const memberToRemove = ref<ProjectMemberData | null>(null)

const transferDialog = ref(false)
const transferring = ref(false)
const memberToPromote = ref<ProjectMemberData | null>(null)

const leaveDialog = ref(false)
const leaving = ref(false)

const isOwner = computed(() => role.value === 'owner')

const active = computed(() => members.value.filter(m => m.status === 'active'))
const owner = computed(() => active.value.find(m => m.role === 'owner') ?? null)
const collaborators = computed(() => active.value.filter(m => m.role !== 'owner'))
// The server only sends these to the owner.
const pending = computed(() => members.value.filter(m => m.status === 'pending'))

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValidEmail = computed(() => EMAIL_PATTERN.test(email.value.trim()))
const emailRule = (value: string) =>
  !value || EMAIL_PATTERN.test(value.trim()) || 'Enter a valid email address'

const nameOf = (member: ProjectMemberData) =>
  member.user?.username || member.user?.email || member.email || 'Unknown user'

const emailOf = (member: ProjectMemberData) =>
  member.user?.email ?? member.email ?? ''

const isMe = (member: ProjectMemberData) =>
  !!member.user && member.user._id === appStore.currentUser?._id

const load = async () => {
  if (!projectId.value) return

  try {
    const [project, list] = await Promise.all([
      fetchProject(projectId.value),
      fetchMembers(projectId.value),
    ])
    role.value = project.role ?? null
    projectName.value = project.name
    members.value = list
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    loading.value = false
  }
}

const submitInvite = async () => {
  if (!isValidEmail.value) return

  inviting.value = true
  error.value = ''

  try {
    await inviteMember(projectId.value, email.value.trim())
    email.value = ''
    await load()
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    inviting.value = false
  }
}

const revoke = async (member: ProjectMemberData) => {
  revoking.value = member._id
  error.value = ''

  try {
    await revokeInvitation(projectId.value, member._id)
    await load()
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    revoking.value = null
  }
}

const confirmRemove = (member: ProjectMemberData) => {
  memberToRemove.value = member
  removeDialog.value = true
}

const submitRemove = async () => {
  const userId = memberToRemove.value?.user?._id
  if (!userId) return

  removing.value = true
  error.value = ''

  try {
    await removeMember(projectId.value, userId)
    removeDialog.value = false
    await load()
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    removing.value = false
  }
}

const confirmTransfer = (member: ProjectMemberData) => {
  memberToPromote.value = member
  transferDialog.value = true
}

const submitTransfer = async () => {
  const userId = memberToPromote.value?.user?._id
  if (!userId) return

  transferring.value = true
  error.value = ''

  try {
    await transferOwnership(projectId.value, userId)
    transferDialog.value = false
    // Reloading picks up the new role, so this page switches to the
    // collaborator view. The new owner's page switches via membersChanged.
    await load()
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    transferring.value = false
  }
}

const submitLeave = async () => {
  leaving.value = true
  error.value = ''

  try {
    await leaveProject(projectId.value)
    leaveDialog.value = false
    appStore.flash = 'You left the project.'
    router.push({ name: '/' })
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    leaving.value = false
  }
}

let teardown: (() => void) | null = null

onMounted(async () => {
  await load()
  // Someone else inviting, accepting or leaving updates this page live.
  teardown = setupMembersSocketListeners(load)
})

onUnmounted(() => {
  teardown?.()
})
</script>
