<template>
  <v-form v-model="valid" ref="form" @submit.prevent="submit" method="Post">
     <v-container>
      <h1 class="pb-1 font-bold text-xl" align="center">Generate Timetable</h1>
      <h3 class="my-2 font-semibold">Hard constraints:</h3>
      <v-row v-for="hardConstraint in hardConstraints" :key="hardConstraint._id">
        <v-switch hide-details color="hard-constraint" class="my-1" v-model="hardConstraint.active" :label="hardConstraint.description"
          @change="handleSwitchChange(hardConstraint)"></v-switch>
      </v-row>
      <h3 class="my-2 font-semibold">Soft constraints:</h3>
      <v-row v-for="softConstraint in softConstraints" :key="softConstraint._id">
        <v-switch hide-details color="soft-constraint" class="my-1" v-model="softConstraint.active" :label="softConstraint.description"
          @change="handleSwitchChange(softConstraint)"></v-switch>
      </v-row>
      <v-btn color="primary" type="submit" block class="mt-2" v-if="!generating">
        Generate
      </v-btn>
      <v-btn color="error" @click="emitGenerationCancelled" block class="mt-2" v-else>
        Cancel
      </v-btn>
      <GenerationRunCard :run="generationStore.latest" />
      <GenerationRunHistory v-if="generationStore.runs.length" :runs="generationStore.runs" />
     </v-container>
  </v-form>
</template>

<script setup lang="ts">

import type { ConstraintData } from '@/modules/constraint/constraint.type';
import { fetchConstraints } from '@/modules/constraint/constraint.api';
import { setupConstraintSocketListeners, emitUpdateConstraint } from '@/modules/constraint/constraint.socket';
import { emitGenerationStarted, emitGenerationCancelled } from '@/modules/generation/generation.socket';
import { useGenerationStore } from '@/modules/generation/generation.store';

const hardConstraints = ref<ConstraintData[]>([])
const softConstraints = ref<ConstraintData[]>([])
const valid = ref(false)

// The sidebar loads the project's runs and keeps them current.
const generationStore = useGenerationStore();
const generating = computed(() => generationStore.generating);

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

const submit = () => {
  emitGenerationStarted()
}

let teardown: (() => void) | null = null

onMounted(async () => {
  await fetchConstraintss()
  teardown = setupConstraintSocketListeners(hardConstraints, softConstraints)
})

onUnmounted(() => {
  teardown?.()
});
</script>