<template>
  <v-data-table :headers="headers" :items="classHours" class="elevation-1">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Class Hours</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="800px">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" dark class="mb-2" v-bind="props" @click="editItem(undefined)">
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
                <v-combobox v-model="editedItem.class" label="Class" :items="allClasses" item-text="name"></v-combobox>
                <v-combobox v-model="editedItem.teacher" label="Teacher" :items="allTeachers"
                  item-text="name"></v-combobox>
                <v-combobox v-model="editedItem.subject" label="Subject" :items="allSubjects"
                  item-text="name"></v-combobox>
                <v-text-field v-model.number="editedItem.weight" label="Course hour weight"></v-text-field>
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
    <template v-slot:[`item.class`]="{ item }">
      <v-label>
        {{ item.class.name }}
      </v-label>
    </template>
    <template v-slot:[`item.teacher`]="{ item }">
      <v-label>
        {{ item.teacher.name }}
      </v-label>
    </template>
    <template v-slot:[`item.subject`]="{ item }">
      <v-label>
        {{ item.subject.name }}
      </v-label>
    </template>
  </v-data-table>
</template>

<script>
import fetchService from '../../../services/fetch.service';

export default {
  data() {
    return {
      dialog: false,
      dialogDelete: false,
      headers: [
        { text: 'Number', value: 'number' },
        { text: 'Class', value: 'class' },
        { text: 'Teacher', value: 'teacher' },
        { text: 'Subject', value: 'subject' },
        { text: 'Weight', value: 'weight' },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      allClasses: [],
      allTeachers: [],
      allSubjects: [],
      classHours: [],
      editedIndex: -1,
      editedItem: {
        _id: '',
        number: null,
        class: null,
        teacher: null,
        subject: null,
        weight: 1
      },
    }
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Class Hour' : 'Edit Class Hour'
    },
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },

  async created() {
    await this.fetchClassHours()
    this.setupSocketListeners()
  },

  methods: {
    async fetchClassHours() {
      try {
        const response = await fetchService.fetchWithAuth('classHours')
        const classHours = await response.json()
        this.classHours = classHours.data
      }
      catch (error) {
        console.log(error)
      }
    },
    async setEditedItem() {
      this.editedItem = this.classHours[this.editedIndex];
    },
    async fetchClasses() {
      try {
        const response = await fetchService.fetchWithAuth('classes')
        const classes = await response.json()
        this.allClasses = classes.data
      }
      catch (error) {
        console.log(error)
      }
    },
    async fetchTeachers() {
      try {
        const response = await fetchService.fetchWithAuth('teachers')
        const teachers = await response.json()
        this.allTeachers = teachers.data
      }
      catch (error) {
        console.log(error)
      }
    },
    async fetchSubjects() {
      try {
        const response = await fetchService.fetchWithAuth('subjects')
        const subjects = await response.json()
        this.allSubjects = subjects.data
      }
      catch (error) {
        console.log(error)
      }
    },
    async editItem(item) {
      await this.fetchClasses()
      await this.fetchTeachers()
      await this.fetchSubjects()
      this.editedIndex = this.classHours.indexOf(item)
      if (this.editedIndex !== -1) {
        await this.setEditedItem()
      } else {
        this.editedItem.name = ''
      }
      this.dialog = true
    },

    async deleteItem(item) {
      this.editedIndex = this.classHours.indexOf(item)
      await this.setEditedItem()
      this.dialogDelete = true
    },

    async deleteItemConfirm() {
      this.$socket.emit('sendDeleteClassHour', { id: this.editedItem._id });
      this.closeDelete()
    },

    close() {
      this.dialog = false
    },
    closeDelete() {
      this.dialogDelete = false
    },

    async save() {
      let classHour = {
        number: this.editedItem.number,
        class: this.editedItem.class,
        teacher: this.editedItem.teacher,
        subject: this.editedItem.subject,
        weight: this.editedItem.weight
      }
      if (this.editedIndex > -1) {
        this.$socket.emit('sendUpdateClassHour', { id: this.editedItem._id, classHour: classHour });
      } else {
        this.$socket.emit('sendCreateClassHour', { classHour: classHour });
      }
      this.close()
    },
    setupSocketListeners() {
      this.$socket.on('updateClassHour', async (obj) => {
        const index = this.classHours.findIndex(classHour => classHour._id === obj.id);
        if (index !== -1) {
          this.$set(this.classHours, index, obj.classHour);
        }
      })
      this.$socket.on('createClassHour', async (obj) => {
        this.classHours.push(obj.classHour);
      })
      this.$socket.on('deleteClassHour', async (obj) => {
        if (obj.error) {
          console.log(obj.error)
        }
        else {
          const index = this.classHours.findIndex(classHour => classHour._id === obj.id);
          if (index !== -1) {
            this.classHours.splice(index, 1);
          }
        }
      })
    }
  }
}

</script>

<style></style>