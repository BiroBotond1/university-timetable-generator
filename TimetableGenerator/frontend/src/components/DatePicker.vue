<template>
  <v-data-table :items-per-page="-1" hide-default-footer :headers="headers" :items="items" class="border">
    <template v-slot:[`item.monday`]="{ item }">
      <v-btn class="hourButton" @click="chooseItem(0, convertHourToInt(item.hours))"
        v-bind:color="props.modelValue[0][convertHourToInt(item.hours)] === 0 ? 'green' : 'red'"> {{ getButtonText(0, item.hours)
        }}
      </v-btn>
    </template>
    <template v-slot:[`item.tuesday`]="{ item }">
      <v-btn class="hourButton" @click="chooseItem(1, convertHourToInt(item.hours))"
        v-bind:color="props.modelValue[1][convertHourToInt(item.hours)] === 0 ? 'green' : 'red'"> {{ getButtonText(1, item.hours)
        }}
      </v-btn>
    </template>
    <template v-slot:[`item.wednesday`]="{ item }">
      <v-btn class="hourButton" @click="chooseItem(2, convertHourToInt(item.hours))"
        v-bind:color="props.modelValue[2][convertHourToInt(item.hours)] === 0 ? 'green' : 'red'"> {{ getButtonText(2, item.hours)
        }}
      </v-btn>
    </template>
    <template v-slot:[`item.thursday`]="{ item }">
      <v-btn class="hourButton" @click="chooseItem(3, convertHourToInt(item.hours))"
        v-bind:color="props.modelValue[3][convertHourToInt(item.hours)] === 0 ? 'green' : 'red'"> {{ getButtonText(3, item.hours)
        }}
      </v-btn>
    </template>
    <template v-slot:[`item.friday`]="{ item }">
      <v-btn class="hourButton" @click="chooseItem(4, convertHourToInt(item.hours))"
        v-bind:color="props.modelValue[4][convertHourToInt(item.hours)] === 0 ? 'green' : 'red'"> {{ getButtonText(4, item.hours)
        }}
      </v-btn>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">

const props = defineProps<{
  modelValue: number[][];
}>();

const headers = ref([
        { title: "Hours", key: "hours" },
        { title: "Monday", key: "monday" },
        { title: "Tuesday", key: "tuesday" },
        { title: "Wednesday", key: "wednesday" },
        { title: "Thursday", key: "thursday" },
        { title: "Friday", key: "friday" },
      ])

const items = ref([
        { hours: "8-9" },
        { hours: "9-10" },
        { hours: "10-11" },
        { hours: "11-12" },
        { hours: "12-13" },
        { hours: "13-14" },
        { hours: "14-15" },
        { hours: "15-16" }
      ])

const convertHourToInt = (hour: string) => {
  return parseInt(hour.substring(0, hour.indexOf('-'))) - 8;
}

const chooseItem = (day: number, hour: number) => {
  if (props.modelValue[day][hour] === 0) {
    props.modelValue[day][hour] = -1
  } else {
    props.modelValue[day][hour] = 0
  }
}

const getButtonText =(index: number, hours: string) => {
  return props.modelValue[index][convertHourToInt(hours)] === 0 ? "Free" : "Occupied";
}
</script>

<style>
.hourButton {
  width: 100px
}

.border {
  border: 1px solid black;
  border-collapse: collapse;
}
</style>