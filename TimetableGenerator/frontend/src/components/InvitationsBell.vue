<template>
  <v-menu v-model="open" :close-on-content-click="false" location="bottom end" max-width="380">
    <template v-slot:activator="{ props }">
      <v-btn icon v-bind="props" :aria-label="label" class="mr-1">
        <v-badge
          :model-value="invitationStore.count > 0"
          :content="invitationStore.count"
          color="error"
        >
          <v-icon :icon="invitationStore.count > 0 ? 'mdi-bell-ring' : 'mdi-bell-outline'"></v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-card min-width="320">
      <v-card-title class="text-subtitle-1">Invitations</v-card-title>

      <v-alert v-if="error" type="error" density="compact" class="mx-4 mb-2">
        {{ error }}
      </v-alert>

      <v-card-text v-if="!invitationStore.count" class="text-medium-emphasis">
        No pending invitations.
      </v-card-text>

      <v-list v-else density="compact">
        <v-list-item
          v-for="invitation in invitationStore.invitations"
          :key="invitation._id"
          :title="invitation.project?.name ?? 'Unnamed project'"
          :subtitle="`From ${inviterOf(invitation)}`"
        >
          <template #prepend>
            <v-icon icon="mdi-school-outline"></v-icon>
          </template>
          <template #append>
            <v-btn
              size="small"
              variant="text"
              color="primary"
              :loading="busy === invitation._id"
              @click="respond(invitation, true)"
            >
              Accept
            </v-btn>
            <v-btn
              size="small"
              variant="text"
              :disabled="busy === invitation._id"
              @click="respond(invitation, false)"
            >
              Decline
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { useInvitationStore } from '@/modules/project/invitation.store'
import type { ProjectInvitationData } from '@/modules/project/project.type'

const invitationStore = useInvitationStore()

const open = ref(false)
const busy = ref<string | null>(null)
const error = ref('')

const label = computed(() =>
  invitationStore.count > 0
    ? `${invitationStore.count} pending invitation${invitationStore.count === 1 ? '' : 's'}`
    : 'Invitations'
)

const inviterOf = (invitation: ProjectInvitationData) =>
  invitation.invitedBy?.username ?? invitation.invitedBy?.email ?? 'someone'

const respond = async (invitation: ProjectInvitationData, accept: boolean) => {
  busy.value = invitation._id
  error.value = ''

  try {
    await invitationStore.respond(invitation.project._id, accept)
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    busy.value = null
  }
}
</script>
