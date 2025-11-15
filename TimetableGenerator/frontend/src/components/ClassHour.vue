<template>
  <div app>
    <div v-if="props.hour">
      <div class="text-[0.9em] font-bold">
        <span class="text-subject">{{ props.hour.subject?.name }}</span>
      </div>
      <div class="flex flex-col items-start mt-0.5 text-[0.8em] font-bold">
        <span v-if="props.hour.teacher" class="text-teacher">{{ props.hour.teacher.name }}</span>
        <span v-if="props.hour.class" class="text-class">{{ props.hour.class.name }}</span>
        <span v-if="location" class="text-location">{{ location }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import type { ClassHourShowData } from '@/modules/classhour/classhour.type';

const props = withDefaults(defineProps<{
  hour : ClassHourShowData | undefined
  showLocation?: boolean
}>(),
{
  showLocation: true
})

const location = computed(() => {
  if (props.hour === undefined || !props.showLocation)
    return undefined

  if(props.hour.location)
    return props.hour.location.name

  if(props.hour.class) 
    return props.hour.class.location

  return undefined
})
</script>