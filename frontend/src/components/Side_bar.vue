<template>
  <div>
    <v-app-bar color="#1D0C59" app clipped-left clipped-right flat dark>
      <v-toolbar-title>
        TimetableGenerator
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-progress-circular v-if="generating" :width="8" indeterminate color="white"></v-progress-circular>
      <v-alert v-if="notification" color="success" icon="$success" density="compact">
        Generating is done!"</v-alert>
    </v-app-bar>

    <v-navigation-drawer color="#1D0C59" app permanent clipped mini-variant dark expand-on-hover>
      <v-list dense nav>
        <v-list-item v-for="item in items" :key="item.title" link :to="item.route">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item v-for="item in catalogItems" :key="item.title" link :to="item.route" :disabled=generating>
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>

import store from '../store/index.js';

export default {
  name: 'App',
  data: () => ({
    items: [
      { title: 'Generate timetable', icon: 'mdi-pencil', route: '/' },
      { title: 'Locations', icon: 'mdi-map-marker', route: '/locations' },
      { title: 'Teachers', icon: 'mdi-account-edit', route: '/teachers' },
      { title: 'Subjects', icon: 'mdi-book-variant', route: '/subjects' },
      { title: 'Classes', icon: 'mdi-account-group', route: '/classes' },
      { title: 'ClassHours', icon: 'mdi-clock-outline', route: '/classHours' },
    ],
    catalogItems: [
      { title: 'Class Catalogs', icon: 'mdi-calendar-clock-outline', route: '/classCatalogs' },
      { title: 'Teacher Catalogs', icon: 'mdi-calendar-account-outline', route: '/teacherCatalogs' },
      { title: 'Location Catalogs', icon: 'mdi-file-marker', route: '/locationCatalogs' },
    ],
  }),
  computed: {
    generating() {
      return store.getters.getGeneration
    },
    notification() {
      return store.getters.getNotification
    },
  },
};
</script>

<style></style>