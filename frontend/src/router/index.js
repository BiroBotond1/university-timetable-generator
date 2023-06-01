import Vue from 'vue'
import VueRouter from 'vue-router'
import GeneratorView from '../views/GeneratorView.vue'
import SubjectsView from '../views/SubjectsView.vue'
import LocationsView from '../views/LocationsView.vue'
import TeachersView from '../views/TeachersView.vue'
import ClassesView from '../views/ClassesView.vue'
import ClassHoursView from '../views/ClassHoursView.vue'
import ClassCatalogView from '../views/ClassCatalogView.vue'
import TeacherCatalogView from '../views/TeacherCatalogView.vue'
import LocationCatalogView from '../views/LocationCatalogView.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Generator',
    component: GeneratorView,
  },
  {
    path: '/subjects',
    name: 'Subjects',
    component: SubjectsView,
  },
  {
    path: '/locations',
    name: 'Locations',
    component: LocationsView
  },
  {
    path: '/teachers',
    name: 'Teachers',
    component: TeachersView
  },
  {
    path: '/classes',
    name: 'Classes',
    component: ClassesView
  },
  {
    path: '/classHours',
    name: 'ClassHours',
    component: ClassHoursView
  },
  {
    path: '/classCatalogs',
    name: 'Class Catalogs',
    component: ClassCatalogView
  },
  {
    path: '/teacherCatalogs',
    name: 'Teacher Catalogs',
    component: TeacherCatalogView
  },
  {
    path: '/locationCatalogs',
    name: 'Location Catalogs',
    component: LocationCatalogView
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.name;
  next();
});

export default router
