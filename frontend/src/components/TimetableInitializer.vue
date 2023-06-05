<template>
    <v-form v-model="valid" ref="form" @submit.prevent="submit" method="Post">
        <v-container>
            <h1 align="center">Generate Timetable</h1>
            <h3>Hard contraints:</h3>
            <v-row>
                <v-switch
                color="#0D47A1"
                v-model="oneTypeOfCourseOnADayClass"
                label="Only one type of course on a day"
                ></v-switch>
            </v-row>
            <v-row>
                <v-switch
                color="#0D47A1"
                v-model="classCoursesStartsAtEight"
                label="Class courses starts at 8:00"
                ></v-switch>
            </v-row>
            <v-row>
                <v-switch
                color="#0D47A1"
                v-model="noHoleHoursInClass"
                label="No hole hour in class catalogs"
                ></v-switch>
            </v-row>
            <h3>Soft contraints:</h3>
            <v-row>
                <v-switch
                color="#90CAF9"
                v-model="evenHoursInClass"
                label="Even hours through the week in class catalogs"
                ></v-switch>
            </v-row>
            <v-row>
                <v-switch
                color="#90CAF9"
                v-model="noHoleHoursInTeacher"
                label="No hole hour in teacher catalogs"
                ></v-switch>
            </v-row>
            <v-row>
                <v-switch
                color="#90CAF9"
                v-model="evenHoursInTeacher"
                label="Even hours through the week in teacher catalogs"
                ></v-switch>
            </v-row>
            <v-row>
                <v-switch
                color="#90CAF9"
                v-model="coursesWeightInClass"
                label="Courses weight in class catalogs"
                ></v-switch>
            </v-row>
            <v-btn color="#1E88E5" type="submit" block class="mt-2 white--text" :disabled="!valid">
                Generate
            </v-btn>
        </v-container>
    </v-form>
</template>

<script>
import axios from 'axios'
import store from '../store/index.js';

export default {
    name: 'TimetableInitializer',
    data: () => ({
        json: null,
        valid: false,
        oneTypeOfCourseOnADayClass: true,
        classCoursesStartsAtEight: true,
        noHoleHoursInClass: true,
        evenHoursInClass: true,
        noHoleHoursInTeacher: true,
        evenHoursInTeacher: true,
        coursesWeightInClass: true,
        courseNumber: null,
        courses: [],
    }),

    methods: {
      async submit () {
        store.commit('IsGenerating');
        const params = {
        OneTypeOfCourseOnADayClass:this.oneTypeOfCourseOnADayClass,
        ClassCoursesStartsAtEight: this.classCoursesStartsAtEight,
        NoHoleHoursInClass: this.noHoleHoursInClass,
        EvenHoursInClass: this.evenHoursInClass,
        NoHoleHoursInTeacher: this.noHoleHoursInTeacher,
        EvenHoursInTeacher: this.evenHoursInTeacher,
        CoursesWeightInClass: this.coursesWeightInClass,
        }
        await axios
            .post('http://127.0.0.1:3000/timetable/proba', params)
            .catch(error => console.log(error));
        store.commit('GenerationDone');
        store.state.notification = true
        setTimeout(() => store.state.notification = false, 5000);

      },
    },
};



</script>

<style scoped>
</style>
