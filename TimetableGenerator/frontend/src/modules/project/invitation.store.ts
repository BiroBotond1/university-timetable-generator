import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchInvitations, respondToInvitation } from './project.api'
import type { ProjectInvitationData } from './project.type'

/**
 * The signed-in user's unanswered invitations.
 *
 * One source for both places they appear -- the bell in the app bar and the
 * card on the project list -- so answering in one updates the other.
 */
export const useInvitationStore = defineStore('invitations', () => {
  const invitations = ref<ProjectInvitationData[]>([])
  const loading = ref(false)
  const error = ref('')

  /**
   * Bumped whenever the user's project list may have changed: an invitation
   * accepted, a membership removed, a project deleted. Pages that show the
   * list watch it and reload.
   */
  const projectsVersion = ref(0)

  const count = computed(() => invitations.value.length)

  const load = async () => {
    loading.value = true
    error.value = ''

    try {
      invitations.value = await fetchInvitations()
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  const respond = async (projectId: string, accept: boolean) => {
    await respondToInvitation(projectId, accept)

    invitations.value = invitations.value.filter(
      (invitation) => invitation.project?._id !== projectId
    )

    if (accept) {
      projectsVersion.value += 1
    }
  }

  const projectsChanged = () => {
    projectsVersion.value += 1
  }

  return {
    invitations,
    loading,
    error,
    count,
    projectsVersion,
    load,
    respond,
    projectsChanged,
  }
})
