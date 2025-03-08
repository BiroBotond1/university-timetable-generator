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
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
  },
  {
    path: '/',
    name: 'Generator',
    component: GeneratorView,
    meta: { requiresAuth: true } 
  },
  {
    path: '/subjects',
    name: 'Subjects',
    component: SubjectsView,
    meta: { requiresAuth: true } 
  },
  {
    path: '/locations',
    name: 'Locations',
    component: LocationsView,
    meta: { requiresAuth: true } 
  },
  {
    path: '/teachers',
    name: 'Teachers',
    component: TeachersView,
    meta: { requiresAuth: true } 
  },
  {
    path: '/classes',
    name: 'Classes',
    component: ClassesView,
    meta: { requiresAuth: true } 
  },
  {
    path: '/classHours',
    name: 'ClassHours',
    component: ClassHoursView,
    meta: { requiresAuth: true } 
  },
  {
    path: '/classCatalogs',
    name: 'Class Catalogs',
    component: ClassCatalogView,
    meta: { requiresAuth: true } 
  },
  {
    path: '/teacherCatalogs',
    name: 'Teacher Catalogs',
    component: TeacherCatalogView,
    meta: { requiresAuth: true } 
  },
  {
    path: '/locationCatalogs',
    name: 'Location Catalogs',
    component: LocationCatalogView,
    meta: { requiresAuth: true } 
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.name;

  if (to.matched.some(record => record.meta.requiresAuth)) {
    
    const isAuthenticated = localStorage.getItem('token'); // Assuming the token is stored in localStorage

    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      next({ name: 'Login' });
    } else {
      // Proceed to the route if authenticated
      next();
    }
  } else {
    // Proceed to the route if no authentication is required
    next();
  }

  next();
});

export default router
