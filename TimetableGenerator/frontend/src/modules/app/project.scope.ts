import { useAppStore } from './app.store'

/**
 * Builds a project-scoped API path.
 *
 * Every entity endpoint now lives under the project that owns it, so the
 * project is part of the URL rather than an invisible ambient value.
 */
export const scoped = (path: string) => {
  const appStore = useAppStore()

  if (!appStore.projectId) {
    throw new Error('No project selected')
  }

  return `projects/${appStore.projectId}/${path}`
}
