<template>
  <v-form v-model="valid" ref="form" @submit.prevent="submit" method="Post">
    <v-container>
      <h1 align="center">Generate Timetable</h1>
      <h3>Hard constraints:</h3>
      <v-row v-for="hardConstraint in hardConstraints" :key="hardConstraint._id">
        <v-switch color="#0D47A1" v-model="hardConstraint.active" :label="hardConstraint.description"
          @change="handleSwitchChange(hardConstraint)"></v-switch>
      </v-row>
      <h3>Soft constraints:</h3>
      <v-row v-for="softConstraint in softConstraints" :key="softConstraint._id">
        <v-switch color="#90CAF9" v-model="softConstraint.active" :label="softConstraint.description"
          @change="handleSwitchChange(softConstraint)"></v-switch>
      </v-row>
      <v-btn color="#1E88E5" type="submit" block class="mt-2 white--text" :disabled="generating">
        Generate
      </v-btn>
    </v-container>
  </v-form>
</template>

<script>
import store from '../store/index.js';

export default {
  name: 'TimetableInitializer',
  data: () => ({
    hardConstraints: [],
    softConstraints: [],
    json: null,
    valid: false,
    courseNumber: null,
    courses: [],
  }),

  async created() {
    await this.fetchConstraints()

    this.$socket.on('updateConstraints', async (updatedConstraint) => {
      this.updateConstraints(this.hardConstraints, updatedConstraint)
      this.updateConstraints(this.softConstraints, updatedConstraint)
    })
  },

  computed: {
    generating() {
      return store.getters.getGeneration
    }
  },

  methods: {
    async submit() {
      await fetch('http://127.0.0.1:3000/timetable/generateTimetable', {
        method: "POST"
      }).catch(error => console.log(error));

      store.state.notification = true
      setTimeout(() => store.state.notification = false, 5000);

    },
    async fetchConstraints() {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/constraints');
        const constraints = await response.json();
        this.hardConstraints = []
        this.softConstraints = []
        constraints.data.forEach((constraint) => {
          constraint.hard ? this.hardConstraints.push(constraint) : this.softConstraints.push(constraint)
        })
      } catch (error) {
        console.log(error);
      }
    },
    async handleSwitchChange(constraint) {
      try {
        this.$socket.emit('sendUpdateConstraints', constraint);
      } catch (error) {
        console.log(error);
      }
    },
    updateConstraints(constraints, updatedConstraint) {
      const index = constraints.findIndex(constraint => constraint._id === updatedConstraint._id);
      if (index !== -1) {
        this.$set(constraints, index, updatedConstraint);
        return;
      }
    }
  },
};
</script>

<style scoped></style>
