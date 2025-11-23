// Plugins
import vuetify from './vuetify'
import pinia from './store'
import auth0 from './auth0'
import router from '../router'

// Types
import type { App } from 'vue'

export function registerPlugins (app: App) {
  app
    .use(vuetify)
    .use(auth0)
    .use(router)
    .use(pinia)
}
