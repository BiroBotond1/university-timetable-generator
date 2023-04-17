<template>
   <div>
    <v-app-bar app clipped-left clipped-right flat dark>
      <v-toolbar-title>
        TimetableGenerator
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-navigation-drawer 
        app 
        permanent
        clipped 
        mini-variant
        dark 
        expand-on-hover>
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
          <v-list-item v-for="item in catalogItems" :key="item.title" link :to="item.route">
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
    ]
  }),
};
</script>

<style>

</style>