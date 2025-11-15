<template>
  <v-data-table :headers="headers" :items="subjects" density="comfortable">
    <template v-slot:top>
      <v-toolbar flat color="primary">
        <v-toolbar-title>Subjects</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="800px">
          <template v-slot:activator="{ props }">
            <v-btn color="white" dark class="mb-2" v-bind="props" @click="editItem(undefined)">
              New Subject
            </v-btn>
          </template>
          <v-card color="background">
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-text-field v-model="editedItem.name" label="Subject name"></v-text-field>
              <v-combobox 
                v-model="editedItem.locations"
                label="Locations"
                :items="allLocations"
                item-title="name"
                multiple>
              </v-combobox>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" variant="flat" @click="close">
                Cancel
              </v-btn>
              <v-btn color="primary" variant="flat" @click="save">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card color="background">
            <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" variant="flat" @click="closeDelete">Cancel</v-btn>
              <v-btn color="primary" variant="flat" @click="deleteItemConfirm">OK</v-btn>
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
    <template v-slot:[`item.locations`]="{ item }">
      <v-label v-for="location in item.locations" :key="location._id">
        [{{ location.name }}]
      </v-label>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import type { SubjectData } from '@/modules/subject/subject.type';
import type { LocationData } from '@/modules/location/location.type';
import { fetchSubjects } from '@/modules/subject/subject.api';
import { fetchLocations } from '@/modules/location/location.api';
import { setupSubjectSocketListeners, emitCreateSubject, emitDeleteSubject, emitUpdateSubject } from '@/modules/subject/subject.socket';

const dialog = ref(false)
const dialogDelete = ref(false)
const headers = ref([
  { title: 'Name', key: 'name', },
  { title: 'Locations', key: "locations" },
  { title: 'Actions', key: 'actions', sortable: false }
])
const subjects = ref<SubjectData[]>([])
const allLocations = ref<LocationData[]>([])
const editedIndex = ref(-1)
const editedItem = ref<SubjectData>({
  _id: '',
  name: '',
  locations: []
})

const formTitle = computed(() => editedIndex.value === -1 ? 'New Subject' : 'Edit Subject')

watch(dialog, (val) => {
  val || close()
})

watch(dialogDelete, (val) => {
  val || closeDelete()
})

onMounted(async () => {
  subjects.value = await fetchSubjects()
  setupSubjectSocketListeners(subjects)
})

const setEditedItem = () => {
  editedItem.value = subjects.value[editedIndex.value];
}

const editItem = async (item: SubjectData | undefined) => {
  allLocations.value = await fetchLocations()
  if(!item) {
    editedIndex.value = -1
    editedItem.value.name = ''
    editedItem.value.locations = []
  } else {
    editedIndex.value = subjects.value.indexOf(item)
    if (editedIndex.value !== -1) {
      editedItem.value = { ...subjects.value[editedIndex.value] };
  }
  }
  
  dialog.value = true
}

const deleteItem = async(item: SubjectData) => {
  editedIndex.value = subjects.value.indexOf(item)
  await setEditedItem()
  dialogDelete.value = true
}

const deleteItemConfirm = () => {
  emitDeleteSubject(editedItem.value._id)
  closeDelete()
}

const close = () => {
  dialog.value = false
}

const closeDelete = () => {
  dialogDelete.value = false
}

const save = () => {
  let subject = {
    name: editedItem.value.name,
    locations: editedItem.value.locations
  }
  if (editedIndex.value > -1) {
    emitUpdateSubject(editedItem.value._id, subject)
  } else {
    emitCreateSubject(subject)
  }
  close()
}
</script>