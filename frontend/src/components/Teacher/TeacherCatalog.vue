<template>
  <v-data-table app :items-per-page="-1" hide-default-footer :headers="headers" :items="items" class="border">
    <template v-slot:[`item.monday`]="{ item }">
      <ClassHourComponent :hour="catalog[0][convertHourToInt(item.hours)]" />
    </template>
    <template v-slot:[`item.tuesday`]="{ item }">
      <ClassHourComponent :hour="catalog[1][convertHourToInt(item.hours)]" />
    </template>
    <template v-slot:[`item.wednesday`]="{ item }">
      <ClassHourComponent :hour="catalog[2][convertHourToInt(item.hours)]" />
    </template>
    <template v-slot:[`item.thursday`]="{ item }">
      <ClassHourComponent :hour="catalog[3][convertHourToInt(item.hours)]" />
    </template>
    <template v-slot:[`item.friday`]="{ item }">
      <ClassHourComponent :hour="catalog[4][convertHourToInt(item.hours)]" />
    </template>
  </v-data-table>
</template>

<script>
import Vue from 'vue'
import ClassHourComponent from '../ClassHour.vue'
import fetchService from '../../../services/fetch.service';

export default {
  data() {
    return {
      headers: [
        { text: "Hours", value: "hours" },
        { text: "Monday", value: "monday" },
        { text: "Tuesday", value: "tuesday" },
        { text: "Wednesday", value: "wednesday" },
        { text: "Thursday", value: "thursday" },
        { text: "Friday", value: "friday" },
      ],
      items: [
        { hours: "8-9" },
        { hours: "9-10" },
        { hours: "10-11" },
        { hours: "11-12" },
        { hours: "12-13" },
        { hours: "13-14" },
        { hours: "14-15" },
        { hours: "15-16" }
      ],
      teacherID: '',
      locations: [],
      classes: [],
      subjects: [],
      catalog:
        [["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""]],
      active: true,
    }
  },

  async created() {
    await this.fetchCatalog()
  },

  components: {
    ClassHourComponent
  },

  watch: {
    async teacherID() {
      await this.fetchCatalog()
    }
  },

  methods: {
    async fetchSubjects() {
      try {
        const response = await fetchService.fetchWithAuth('subjects')
        const subjects = await response.json()
        this.subjects = subjects.data
      }
      catch (error) {
        console.log(error)
      }
    },
    async fetchLocations() {
      try {
        const response = await fetchService.fetchWithAuth('locations')
        const locations = await response.json()
        this.locations = locations.data
      } catch (error) {
        console.log(error)
      }
    },
    async fetchClasses() {
      try {
        const response = await fetchService.fetchWithAuth('classes');
        const classes = await response.json()
        this.classes = classes.data
      }
      catch (error) {
        console.log(error)
      }
    },
    async fetchCatalog() {
      await this.fetchLocations();
      await this.fetchSubjects();
      await this.fetchClasses();
      const response = await fetchService.fetchWithAuth('teachers/' + this.teacherID)
        .catch(error => console.log(error))
      const catalog = await response.json()
      let catalogClassHours = catalog.data.catalog
      for (var day = 0; day < this.catalog.length; day++) {
        for (var hour = 0; hour < this.catalog[day].length; hour++) {
          let classHour = {}
          classHour.location = ''
          if (!catalogClassHours) {
            classHour.subject = ''
            classHour.location = ''
            classHour.class = ''
            Vue.set(this.catalog[day], hour, classHour)
            continue
          }
          if (catalogClassHours[day][hour] === '') {
            classHour.subject = ''
            classHour.location = ''
            classHour.class = ''
          } else {
            for (const subject of this.subjects) {
              if (subject._id === catalogClassHours[day][hour].subjectID) {
                classHour.subject = subject.name
              }
            }
            for (const location of this.locations) {
              if (location._id === catalogClassHours[day][hour].locationID) {
                classHour.location = location.name
              }
            }
            for (const clas of this.classes) {
              if (clas._id === catalogClassHours[day][hour].classID) {
                classHour.class = clas.name
                if (classHour.location === '') {
                  classHour.location = clas.location;
                }
              }
            }
          }
          Vue.set(this.catalog[day], hour, classHour)
        }
      }
    },
    convertHourToInt(hour) {
      return parseInt(hour.substring(0, hour.indexOf('-'))) - 8;
    },
  },
}

</script>

<style>
.border {
  border: 1px solid black;
  border-collapse: collapse;
}
</style>