<template>
  <div app>
    <div v-if="props.hour">
      <div class="text-[0.9em] font-bold">
        <span class="text-subject">{{ props.hour.subject}}</span>
      </div>
      <div class="flex flex-col items-start mt-0.5 text-[0.8em] font-bold">
        <span v-if="props.hour.teacher" class="text-teacher">{{ props.hour.teacher }}</span>
        <span v-if="props.hour.class" class="text-class">{{ props.hour.class }}</span>
        <span v-if="props.hour.location" class="text-location">{{ props.hour.location }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import type { ClassHourShowData } from '@/modules/classhour/classhour.type';

const props = defineProps<{
  hour : ClassHourShowData | undefined
}>()
</script>