<template>
  <div class="flex mt-4 justify-center items-center">
    <template v-for="item in visibleItems" :key="item.key">
      <div class="m-0.5 w-5 h-5" :class="item.color"></div>
      <div class="mt-0.5 mr-4">
        {{ item.label }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    showSubject?: boolean;
    showClass?: boolean;
    showTeacher?: boolean;
    showLocation?: boolean;
  }>(),
  {
    showSubject: true,
    showClass: true,
    showTeacher: true,
    showLocation: true,
  }
)

const items = [
  { key: "showSubject", label: "Subject", color: "bg-subject" },
  { key: "showClass", label: "Class", color: "bg-class" },
  { key: "showTeacher", label: "Teacher", color: "bg-teacher" },
  { key: "showLocation", label: "Location", color: "bg-location" },
] as const

const visibleItems = computed(() =>
  items.filter(item => props[item.key])
)
</script>