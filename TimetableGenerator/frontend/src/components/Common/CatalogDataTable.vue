<template>
  <v-data-table
    class="border border-collapse"
    :items-per-page="-1"
    hide-default-footer
    :headers="headers"
    :items="items"
    density="comfortable"
  >
    <template
      v-for="(day, index) in days"
      :key="day.key"
      v-slot:[`item.${day.key}`]="{ item }"
    >
      <ClassHour :hour="props.catalog[index][convertHourToInt(item.hours)]" />
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import type { ClassHourShowData } from "@/modules/classhour/classhour.type";

const props = defineProps<{
  catalog: Array<Array<ClassHourShowData | undefined>>;
}>();

const days = [
  { title: "Monday", key: "monday" },
  { title: "Tuesday", key: "tuesday" },
  { title: "Wednesday", key: "wednesday" },
  { title: "Thursday", key: "thursday" },
  { title: "Friday", key: "friday" },
];

const headers = ref([{ title: "Hours", key: "hours" }, ...days]);

const items = ref([
  { hours: "8-9" },
  { hours: "9-10" },
  { hours: "10-11" },
  { hours: "11-12" },
  { hours: "12-13" },
  { hours: "13-14" },
  { hours: "14-15" },
  { hours: "15-16" },
]);

const convertHourToInt = (hour: string) => {
  return parseInt(hour.substring(0, hour.indexOf("-"))) - 8;
};
</script>
