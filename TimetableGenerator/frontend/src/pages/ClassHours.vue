<template>
  <v-data-table :headers="headers" :items="classHours" class="elevation-1" density="comfortable">
    <template v-slot:top>
      <v-toolbar flat color="light-blue">
        <v-toolbar-title>Class Hours</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="800px">
          <template v-slot:activator="{ props }">
            <v-btn color="white" dark class="mb-2" v-bind="props" @click="editItem(undefined)">
              New Class Hour
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-text-field v-model.number="editedItem.number" label="Course number"></v-text-field>
                <v-combobox v-model="editedItem.class" label="Class" :items="allClasses" item-title="name"></v-combobox>
                <v-combobox v-model="editedItem.teacher" label="Teacher" :items="allTeachers"
                  item-title="name"></v-combobox>
                <v-combobox v-model="editedItem.subject" label="Subject" :items="allSubjects"
                  item-title="name"></v-combobox>
                <v-text-field v-model.number="editedItem.weight" label="Course hour weight"></v-text-field>
              </v-container>
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
          <v-card>
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
      <v-icon size="medium" class="me-2" @click="editItem(item)">
        mdi-pencil
      </v-icon>
      <v-icon size="medium" @click="deleteItem(item)">
        mdi-delete
      </v-icon>
    </template>
    <template v-slot:[`item.class`]="{ item }">
        {{ item.class.name }}
    </template>
    <template v-slot:[`item.teacher`]="{ item }">
        {{ item.teacher.name }}
    </template>
    <template v-slot:[`item.subject`]="{ item }">
        {{ item.subject.name }}
    </template>
  </v-data-table>
</template>

<script setup lang="ts">

import type { ClassData } from '@/modules/class/class.type';
import type { ClassHourData, EditClassHourData } from '@/modules/classhour/classhour.type';
import type { SubjectData } from '@/modules/subject/subject.type';
import type { TeacherData } from '@/modules/teacher/teacher.type';

import { fetchClasses } from '@/modules/class/class.api';
import { fetchClassHours } from '@/modules/classhour/classhour.api';
import { fetchTeachers } from '@/modules/teacher/teacher.api';
import { fetchSubjects } from '@/modules/subject/subject.api';

import { setupClassHourSocketListeners, emitCreateClassHour, emitDeleteClassHour, emitUpdateClassHour } from '@/modules/classhour/classhour.socket';

const dialog = ref(false)
const dialogDelete = ref(false)
const headers = ref([
  { title: 'Number', key: 'number' },
  { title: 'Class', key: 'class' },
  { title: 'Teacher', key: 'teacher' },
  { title: 'Subject', key: 'subject' },
  { title: 'Weight', key: 'weight' },
  { title: 'Actions', key: 'actions', sortable: false }
])
const allClasses = ref<ClassData[]>([])
const allTeachers = ref<TeacherData[]>([])
const allSubjects = ref<SubjectData[]>([])
const classHours = ref<ClassHourData[]>([])
const editedIndex = ref(-1)
const editedItem = ref<EditClassHourData>({
  _id: undefined,
  class: undefined,
  number: undefined,
  subject: undefined,
  teacher: undefined,
  weight: 1
})

const formTitle = computed(() => editedIndex.value === -1 ? 'New Class Hour' : 'Edit Class Hour')

watch(dialog, (val => {
  val || close()
}))

watch(dialogDelete, (val => {
  val || closeDelete()
}))
  
onMounted(async () => {
  classHours.value = await fetchClassHours()
  setupClassHourSocketListeners(classHours)
})

const setEditedItem = async () => {
  editedItem.value = classHours.value[editedIndex.value];
}

const editItem = async (item: ClassHourData | undefined) => {
  allClasses.value = await fetchClasses()
  allTeachers.value = await fetchTeachers()
  allSubjects.value = await fetchSubjects()

  if(!item) {
    editedIndex.value = -1
    editedItem.value = {
      _id: undefined,
      class: undefined,
      number: undefined,
      subject: undefined,
      teacher: undefined,
      weight: 1
    }
  } else {
    editedIndex.value = classHours.value.indexOf(item)
    if (editedIndex.value !== -1) {
      await setEditedItem()
    } 
  }

  dialog.value = true
}

const deleteItem = async (item: ClassHourData) => {
  editedIndex.value = classHours.value.indexOf(item)
  await setEditedItem()
  dialogDelete.value = true
}

const deleteItemConfirm = () => {
  emitDeleteClassHour(editedItem.value._id ?? '')
  closeDelete()
}

const close = () => {
  dialog.value = false
}

const closeDelete = () => {
  dialogDelete.value = false
}

const save = () => {
  if(!editedItem.value)
    return

  let classHour = {
    number: editedItem.value.number,
    class: editedItem.value.class,
    teacher: editedItem.value.teacher,
    subject: editedItem.value.subject,
    weight: editedItem.value.weight
  }
  if (editedIndex.value > -1) {
    emitUpdateClassHour(editedItem.value._id ?? '', classHour)
  } else {
    emitCreateClassHour(classHour)
  }
  close()
}
</script>

<style></style>