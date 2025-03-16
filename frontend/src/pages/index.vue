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

<script setup lang="ts">

import type { ConstraintData } from '@/modules/constraint/constraint.type';
import { fetchConstraints } from '@/modules/constraint/constraint.api';
import { setupConstraintSocketListeners, emitGenerationStarted, emitUpdateConstraint } from '@/modules/constraint/constraint.socket';
import { useAppStore } from '@/modules/app/app.store';

const hardConstraints = ref<ConstraintData[]>([])
const softConstraints = ref<ConstraintData[]>([])
const valid = ref(false)

const appStore = useAppStore();
const generating = computed(() => appStore.generating);

const fetchConstraintss = async () => {
  try {
    const constraints = await fetchConstraints()
    hardConstraints.value = []
    softConstraints.value = []
    constraints.forEach((constraint: ConstraintData) => {
      constraint.hard ? hardConstraints.value.push(constraint) : softConstraints.value.push(constraint)
    })
  } catch (error) {
    console.log(error);
  }
}

const handleSwitchChange = async (constraint: ConstraintData) => {
  try {
    emitUpdateConstraint(constraint)
  } catch (error) {
    console.log(error);
  }
}

// const updateConstraints = async (constraints: ConstraintData[], updatedConstraint: ConstraintData) => {
//   const index = constraints.findIndex(constraint => constraint._id === updatedConstraint._id);
//   if (index !== -1) {
//     constraints[index] = updatedConstraint;
//   }
// }

const submit = () => {
  emitGenerationStarted()
}

onMounted(async () => {
  await fetchConstraintss()
  setupConstraintSocketListeners(hardConstraints, softConstraints)
  // socket.on('GenerationStarted', async () => {
  //   appStore.generating = true
  // })

  // socket.on('GenerationFinished', async () => {
  //   appStore.generating = false
  //   appStore.notification = true
  //   setTimeout(() => appStore.notification = false, 5000);
  // })

  // socket.on('updateConstraints', async (updatedConstraint: ConstraintData) => {
  //   updateConstraints(hardConstraints.value, updatedConstraint)
  //   updateConstraints(softConstraints.value, updatedConstraint)
  // })
})
</script>