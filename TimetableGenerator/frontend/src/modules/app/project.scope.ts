import { useAppStore } from './app.store'

export const scoped = (path: string) => {
  const appStore = useAppStore()

  if (!appStore.projectId) {
    throw new Error('No project selected')
  }

  return `projects/${appStore.projectId}/${path}`
}
