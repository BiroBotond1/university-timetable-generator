<template>
  <v-tooltip text="Edit">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        color="primary"
        size="x-small"
        icon="mdi-pencil"
        variant="text"
        @click="onEdit(props.item)"
      ></v-btn>
    </template>
  </v-tooltip>
  <v-tooltip text="Delete">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        color="error"
        size="x-small"
        icon="mdi-delete"
        variant="text"
        @click="onDelete(props.item)"
      ></v-btn>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">

const props = defineProps<{
  item: any
  onEdit: (item: any) => void
  onDelete: (item: any) => void
}>()

const { onEdit, onDelete } = props

</script>
