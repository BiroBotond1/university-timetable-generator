<template>
   This is the summary page
   <div class="flex">
    <div>
      Class
      <apexchart width="400" type="line" :options="options" :series="classFitnesses"></apexchart>
    </div>
    <div>
      Teacher
      <apexchart width="400" type="line" :options="options" :series="teacherFitnesses"></apexchart>
    </div>
    <div>
      Location
      <apexchart width="400" type="line" :options="options" :series="locationFitnesses"></apexchart>
    </div>
  </div>
</template>

<script setup lang="ts">

import { setupSummarySocketListeners, emitGetGenerationData } from '@/modules/summary/summary.socket';
import type { GenerationData } from '@/modules/summary/summary.type';

const generationData = ref<GenerationData>({
  times: [],
  classFitnesses: [],
  locationFitnesses: [],
  teacherFitnesses: []
})

onMounted(async () => {
  setupSummarySocketListeners(generationData)
  emitGetGenerationData()
})


const options = computed(() => {
  return {
  chart: {
    id: 'vuechart-example'
  },
  xaxis: {
    categories: generationData.value.times,
    tickAmount: 10,
    labels: {
        formatter: (val: string) => {
          const num = parseFloat(val)
          return isNaN(num) ? val : num.toFixed(2)
        }
      }
  }
}
})

const classFitnesses = computed(() => {
  return [{
  name: 'Class fitness',
  data: generationData.value.classFitnesses
}]
})

const teacherFitnesses = computed(() => {
  return [{
  name: 'Teacher fitness',
  data: generationData.value.teacherFitnesses
}]
})

const locationFitnesses = computed(() => {
  return [{
  name: 'Location fitness',
  data: generationData.value.locationFitnesses
}]
})
</script>