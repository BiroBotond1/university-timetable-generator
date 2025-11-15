<template>
  <v-data-table :headers="headers" :items="locations" density="comfortable">
    <template v-slot:top>
      <v-toolbar flat color="primary">
        <v-toolbar-title>Locations</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="900px">
          <template v-slot:activator="{ props }">
            <v-btn
              color="white"
              class="mb-2"
              v-bind="props"
              @click="editItem(undefined)"
            >
              New Location
            </v-btn>
          </template>
          <v-card color="background">
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-text-field
                class="mb-2"
                v-model="editedItem.name"
                label="Location name"
                hide-details
                density="comfortable"
              ></v-text-field>
              <DatePicker v-model="editedItem.reservedDates" />
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" variant="flat" @click="close">
                Cancel
              </v-btn>
              <v-btn color="primary" variant="flat" @click="save"> Save </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card color="background">
            <v-card-title class="text-h5"
              >Are you sure you want to delete this item?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" variant="flat" @click="closeDelete"
                >Cancel</v-btn
              >
              <v-btn color="primary" variant="flat" @click="deleteItemConfirm"
                >OK</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:[`item.actions`]="{ item }">
      <action-buttons
        :item="item"
        :onEdit="editItem"
        :onDelete="deleteItem"
      />
    </template>
    <template v-slot:[`item.reservedDates`]="{ item }">
      <a target="_blank" @click="editItem(item)"> Click to see </a>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import type { LocationData } from "@/modules/location/location.type";
import { fetchLocations } from "@/modules/location/location.api";
import {
  setupLocationSocketListeners,
  emitCreateLocation,
  emitDeleteLocation,
  emitUpdateLocation,
} from "@/modules/location/location.socket";

const dialog = ref(false);
const dialogDelete = ref(false);
const headers = ref([
  { title: "Name", key: "name" },
  { title: "Reserved Dates", key: "reservedDates" },
  { title: "Actions", key: "actions", sortable: false },
]);
const locations = ref<LocationData[]>([]);
const editedIndex = ref(-1);
const editedItem = ref<LocationData>({
  _id: "",
  name: "",
  reservedDates: [],
});

const formTitle = computed(() =>
  editedIndex.value === -1 ? "New Location" : "Edit Location"
);

watch(dialog, (val) => {
  val || close();
});

watch(dialogDelete, (val) => {
  val || closeDelete();
});

onMounted(async () => {
  locations.value = await fetchLocations();
  setupLocationSocketListeners(locations);
});

const setEditedItem = () => {
  editedItem.value = locations.value[editedIndex.value];
};

const editItem = async (item: LocationData | undefined) => {
  if (!item) {
    editedIndex.value = -1;
    editedItem.value.name = "";
    editedItem.value.reservedDates = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ];
  } else {
    editedIndex.value = locations.value.indexOf(item);
    if (editedIndex.value !== -1) {
      editedItem.value = { ...locations.value[editedIndex.value] };
    }
  }

  dialog.value = true;
};

const deleteItem = async (item: LocationData) => {
  editedIndex.value = locations.value.indexOf(item);
  await setEditedItem();
  dialogDelete.value = true;
};

const deleteItemConfirm = () => {
  emitDeleteLocation(editedItem.value._id);
  closeDelete();
};

const close = () => {
  dialog.value = false;
};

const closeDelete = () => {
  dialogDelete.value = false;
};

const save = () => {
  let location = {
    name: editedItem.value.name,
    reservedDates: Object.assign([], editedItem.value.reservedDates),
  };
  if (editedIndex.value > -1) {
    emitUpdateLocation(editedItem.value._id, location);
  } else {
    emitCreateLocation(location);
  }
  close();
};
</script>
