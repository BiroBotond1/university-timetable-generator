<template>
    <v-form v-model="valid" ref="form" @submit.prevent="submit" method="Post">
        <v-container>
            <h1 align="center">Generate Timetable</h1>
            <h3>Hard constraints:</h3>
            <v-row>
                <v-switch
                color="#0D47A1"
                v-model="oneTypeOfCourseOnADayClass"
                label="Classes can have only one lesson from a subject on a given day"
                ></v-switch>
            </v-row>
            <v-row>
                <v-switch
                color="#0D47A1"
                v-model="classCoursesStartsAtEight"
                label="All classes start their lessons at eight o'clock in the morning"
                ></v-switch>
            </v-row>
            <v-row>
                <v-switch
                color="#0D47A1"
                v-model="noHoleHoursInClass"
                label="All classes should have their lessons consistently scheduled back-to-back, meaning no class should have any gaps in their schedule"
                ></v-switch>
            </v-row>
            <h3>Soft constraints:</h3>
            <v-row>
                <v-switch
                color="#90CAF9"
                v-model="evenHoursInClass"
                label="Classes should have an equal number of hours per day, so that there is as little difference as possible between the number of hours on different days of the week, and their lessons should be evenly distributed"
                ></v-switch>
            </v-row>
            <v-row>
                <v-switch
                color="#90CAF9"
                v-model="noHoleHoursInTeacher"
                label="Teachers should have as few gaps in their schedules as possible"
                ></v-switch>
            </v-row>
            <v-row>
                <v-switch
                color="#90CAF9"
                v-model="evenHoursInTeacher"
                label="Teachers should have an equal number of hours per day, so that there is as little difference as possible between the number of hours on different days of the week, and their lessons should be evenly distributed"
                ></v-switch>
            </v-row>
            <v-row>
                <v-switch
                color="#90CAF9"
                v-model="coursesWeightInClass"
                label="It is advisable to schedule prioritized subjects for each class as early as possible"
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
