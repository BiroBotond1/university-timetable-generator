// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'
import { useAuth0 } from '@auth0/auth0-vue'
import { useAppStore } from '@/modules/app/app.store'
import { joinProject, leaveProject } from '@/modules/app/app.socket'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

router.beforeEach(async (to, from, next) => {
  if (to.name == "/Login") {
    return next()
  }

  const { isAuthenticated, isLoading } = useAuth0()

  // Wait for Auth0 to finish loading
  if (isLoading.value) {
    await new Promise(resolve => {
      const stop = watch(isLoading, (v) => {
        if (!v) {
          stop()
          resolve(true)
        }
      })
    })
  }

  //Redirect every other route to /login if not authenticated
  if (!isAuthenticated.value) {
    return next('/Login')
  }

  // Project scope is carried by the URL, so it survives a reload and a pasted
  // link. Entering a project route joins its socket room; leaving drops it.
  const appStore = useAppStore()
  const projectId = 'projectId' in to.params
    ? (to.params.projectId as string)
    : undefined

  if (!projectId) {
    if (appStore.projectId) {
      appStore.projectId = null
      leaveProject()
    }
    return next()
  }

  if (appStore.projectId !== projectId) {
    const joined = await joinProject(projectId)

    if (!joined.ok) {
      // Not a member, or the project is gone. Back to the project list.
      appStore.projectId = null
      return next('/')
    }

    appStore.projectId = projectId
  }

  next()
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
