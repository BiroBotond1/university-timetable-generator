import Vue from 'vue'
import VueRouter from 'vue-router'
import GeneratorView from '../views/GeneratorView.vue'
import SubjectsView from '../views/SubjectsView.vue'
import LocationsView from '../views/LocationsView.vue'
import TeachersView from '../views/TeachersView.vue'
import ClassesView from '../views/ClassesView.vue'
import ClassHoursView from '../views/ClassHoursView.vue'
import ClassCatalogView from '../views/ClassCatalogView.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: GeneratorView
  },
  {
    path: '/subjects',
    name: 'sunjects',
    component: SubjectsView
  },
  {
    path: '/locations',
    name: 'locations',
    component: LocationsView
  },
  {
    path: '/teachers',
    name: 'teachers',
    component: TeachersView
  },
  {
    path: '/classes',
    name: 'classes',
    component: ClassesView
  },
  {
    path: '/classHours',
    name: 'classHours',
    component: ClassHoursView
  },
  {
    path: '/classCatalogs',
    name: 'classCatalogs',
    component: ClassCatalogView
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
