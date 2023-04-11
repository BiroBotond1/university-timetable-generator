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
        }

        console.log(params)

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
