<template>
  <v-data-table :headers="headers" :items="teachers" class="elevation-1" density="comfortable">
    <template v-slot:top>
      <v-toolbar flat color="light-blue">
        <v-toolbar-title>Teachers</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="900px">
          <template v-slot:activator="{ props }">
            <v-btn color="white" dark class="mb-2" v-bind="props" @click="editItem(undefined)">
              New Teacher
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-text-field v-model="editedItem.name" label="Teacher name"></v-text-field>
                <DatePicker v-model="editedItem.inappropriateDates" />
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
    <template v-slot:[`item.inappropriateDates`]="{ item }">
      <a target="_blank" @click="editItem(item)">
        Click to see
      </a>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import type { TeacherData } from '@/modules/teacher/teacher.type';
import { fetchTeachers } from '@/modules/teacher/teacher.api';
import { setupTeacherSocketListeners, emitCreateTeacher, emitDeleteTeacher, emitUpdateTeacher } from '@/modules/teacher/teacher.socket';

const dialog = ref(false)
const dialogDelete = ref(false)
const headers = ref([
  { title: 'Name', key: 'name', },
  { title: 'Inappropriate Dates', key: 'inappropriateDates' },
  { title: 'Actions', key: 'actions', sortable: false }
])
const teachers = ref<TeacherData[]>([])
const editedIndex = ref(-1)
const editedItem = ref<TeacherData>({
  _id: '',
  name: '',
  inappropriateDates: []
})

const formTitle = computed(() => editedIndex.value === -1 ? 'New Teacher' : 'Edit Teacher')

watch(dialog, (val) => {
  val || close()
})

watch(dialogDelete, (val) => {
  val || closeDelete()
})

onMounted(async () => {
  teachers.value = await fetchTeachers()
  setupTeacherSocketListeners(teachers)
})

const setEditedItem = () => {
  editedItem.value = teachers.value[editedIndex.value];
}

const editItem = async (item: TeacherData | undefined) => {
  if(!item) {
    editedIndex.value = -1
    editedItem.value.name = ''
    editedItem.value.inappropriateDates = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  } else {
    editedIndex.value = teachers.value.indexOf(item)
    if (editedIndex.value !== -1) {
      await setEditedItem()
    }
  }

  dialog.value = true
}

const deleteItem = async (item: TeacherData) => {
  editedIndex.value = teachers.value.indexOf(item)
  await setEditedItem()
  dialogDelete.value = true
}

const deleteItemConfirm = () => {
  emitDeleteTeacher(editedItem.value._id)
  closeDelete()
}

const close = () => {
  dialog.value = false
}

const closeDelete = () => {
  dialogDelete.value = false
}

const save = async () => {
  let teacher = {
    name: editedItem.value.name,
    inappropriateDates: Object.assign([], editedItem.value.inappropriateDates)
  }
  if (editedIndex.value > -1) {
    emitUpdateTeacher(editedItem.value._id, teacher)
  } else {
    emitCreateTeacher(teacher)
  }
  close()
}
</script>