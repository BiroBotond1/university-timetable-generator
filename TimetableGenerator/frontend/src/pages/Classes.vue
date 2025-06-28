<template>
  <v-data-table :headers="headers" :items="classes" class="elevation-1" density="comfortable">
    <template v-slot:top>
      <v-toolbar flat color="light-blue">
        <v-toolbar-title>Classes</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="800px">
          <template v-slot:activator="{ props }">
            <v-btn color="white" class="mb-2" v-bind="props" @click="editItem(undefined)">
              New Class
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-text-field v-model="editedItem.name" label="Class name"></v-text-field>
                <v-text-field v-model="editedItem.location" label="Class room"></v-text-field>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="#E53935" class="white--text" @click="close">
                Cancel
              </v-btn>
              <v-btn color="#1E88E5" class="white--text" @click="save">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="#E53935" class="white--text" @click="closeDelete">Cancel</v-btn>
              <v-btn color="#1E88E5" class="white--text" @click="deleteItemConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:[`item.actions`]="{ item }">
      <v-icon size="medium" class="me-2" @click="editItem(item)">
        mdi-pencil
      </v-icon>
      <v-icon size="medium" @click="deleteItem(item)">
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import type { ClassData } from '@/modules/class/class.type';
import { fetchClasses } from '@/modules/class/class.api';
import { setupClassSocketListeners, emitCreateClass, emitUpdateClass, emitDeleteClass } from '@/modules/class/class.socket'

const dialog = ref(false)
const dialogDelete = ref(false)
const headers = ref([
  { title: 'Name', key: 'name', },
  { title: 'Classroom', key: 'location', },
  { title: 'Actions', key: 'actions', sortable: false }
]) 
const classes = ref<ClassData[]>([])
const editedIndex = ref(-1)
const editedItem = ref<ClassData>({
  _id: '',
  name: '',
  location: '',
})

const formTitle = computed(() => editedIndex.value === -1 ? 'New Class' : 'Edit Class')

watch(dialog, (val) => {
  val || close()
})

watch(dialogDelete, (val) => {
  val || closeDelete()
})

onMounted(async () => {
  classes.value = await fetchClasses()
  setupClassSocketListeners(classes)
})

const setEditedItem = () => {
  editedItem.value = classes.value[editedIndex.value]
}

const editItem = (item: ClassData | undefined) => {
  if (!item) {
    editedIndex.value = -1
    editedItem.value.name = ''
    editedItem.value.location = ''
  } else {
    editedIndex.value = classes.value.indexOf(item)
    if (editedIndex.value !== -1) {
      setEditedItem()
    }
  }
  dialog.value = true
}

const deleteItem = (item: ClassData) => {
  editedIndex.value = classes.value.indexOf(item)
  setEditedItem()
  dialogDelete.value = true
}

const deleteItemConfirm = async() => {
  emitDeleteClass(editedItem.value._id);
  closeDelete()
}

const close = () => {
  dialog.value = false
}

const closeDelete = () => {
  dialogDelete.value = false
}

const save = async() => {
  let classs = {
    name: editedItem.value.name,
    location: editedItem.value.location
  }

  if (editedIndex.value > -1) {
    emitUpdateClass(editedItem.value._id, classs)
  } else {
    emitCreateClass(classs)
  }
  close()
}

</script>