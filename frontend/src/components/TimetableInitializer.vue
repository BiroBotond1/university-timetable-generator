<template>
    <v-form v-model="valid" ref="form" @submit.prevent="submit" method="Post">
        <v-container>
            <v-row >
                <v-col
                cols="12"
                md="12"
                >
                <v-text-field
                    v-model.number="changesNumber"
                    :rules="numberRules"
                    :counter="10"
                    label="Changes in one generation"
                    type="number"
                    required
                ></v-text-field>
                </v-col>

                <v-col
                cols="12"
                md="12"
                >
                <v-text-field
                    v-model.number="maxIteration"
                    :rules="numberRules"
                    :counter="10"
                    label="Max iteration"
                    type="number"
                    required
                ></v-text-field>
                </v-col>

                <v-col
                cols="12"
                md="12"
                >
                <v-text-field
                    v-model.number="initialTemperature"
                    :rules="numberRules"
                    :counter="10"
                    label="Initial temperature"
                    type="number"
                    required
                ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-switch
                v-model="oneTypeOfCourseOnADayClass"
                label="Only one type of course on a day"
                ></v-switch>
            </v-row>
            <v-row>
                <v-switch
                v-model="classCoursesStartsAtEight"
                label="Class courses starts at 8:00"
                ></v-switch>
            </v-row>
            <v-row>
                <v-switch
                v-model="noHoleHoursInClass"
                label="No hole hour in class catalogs"
                ></v-switch>
            </v-row>
            <v-row>
                <v-switch
                v-model="evenHoursInClass"
                label="Even hours through the week in class catalogs"
                ></v-switch>
            </v-row>
            <v-row>
                <v-switch
                v-model="noHoleHoursInTeacher"
                label="No hole hour in teacher catalogs"
                ></v-switch>
            </v-row>
            <v-row>
                <v-switch
                v-model="evenHoursInTeacher"
                label="Even hours through the week in teacher catalogs"
                ></v-switch>
            </v-row>
            <v-btn type="submit" block class="mt-2" :disabled="!valid">Submit</v-btn>
            <v-btn block class="mt-2" @click="reset">
            clear
            </v-btn>
        </v-container>
    </v-form>
</template>

<script>
import axios from 'axios'

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
        changesNumber: null,
        maxIteration: null,
        initialTemperature: null,
        courseNumber: null,
        courses: [],
        numberRules: [
            value => {
                if (value) return true
                
                return 'This number is required.'
            },
            value => {
                if (value >= 0) return true

                return 'The number has to be greater than 0.'
            }
        ],
        nameRules: [
            value => {
                if (value) return true

                return 'This name is required.'
            }
        ]
    }),

    methods: {
      async submit () {
        const params = {
        ChangesNumber: this.changesNumber,
        MaxIteration: this.maxIteration,
        InitialTemperature: this.initialTemperature,
        OneTypeOfCourseOnADayClass:this.oneTypeOfCourseOnADayClass,
        ClassCoursesStartsAtEight: this.classCoursesStartsAtEight,
        NoHoleHoursInClass: this.noHoleHoursInClass,
        EvenHoursInClass: this.evenHoursInClass,
        NoHoleHoursInTeacher: this.noHoleHoursInTeacher,
        EvenHoursInTeacher: this.evenHoursInTeacher,
        }

        axios
            .post('http://127.0.0.1:3000/timetable/proba', params)
            .catch(error => console.log(error));
            
      },
      reset () {
        this.$refs.form.reset()
      },
    },
};



</script>

<style scoped>
</style>
