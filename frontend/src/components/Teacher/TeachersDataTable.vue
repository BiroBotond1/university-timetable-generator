<template>
  <v-data-table :headers="headers" :items="teachers" class="elevation-1">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Teachers</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="800px">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" dark class="mb-2" v-bind="props" @click="editItem(undefined)">
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
                <DatePicker ref="teacherDatePicker" />
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

<script>
import DatePicker from '../DatePicker.vue'
import fetchService from '../../../services/fetch.service';

export default {
  data() {
    return {
      dialog: false,
      dialogDelete: false,
      headers: [
        { text: 'Name', value: 'name', },
        { text: 'Inappropriate Dates', value: 'inappropriateDates' },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      teachers: [],
      editedIndex: -1,
      editedItem: {
        _id: '',
        name: '',
        inappropriateDates: []
      },
    }
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Teacher' : 'Edit Teacher'
    },
  },

  components: {
    DatePicker: DatePicker
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
    await this.fetchTeachers()
    this.setupSocketListeners()
  },

  methods: {
    async fetchTeachers() {
      try {
        const response = await fetchService.fetchWithAuth('teachers')
        const teachers = await response.json()
        this.teachers = teachers.data
      }
      catch (error) {
        console.log(error)
      }
    },

    async setEditedItem() {
      this.editedItem = this.teachers[this.editedIndex];
    },
    async editItem(item) {
      this.editedIndex = this.teachers.indexOf(item)
      if (this.editedIndex !== -1) {
        await this.setEditedItem()
      } else {
        this.editedItem.name = ''
        this.editedItem.inappropriateDates = [
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0]
        ]
      }
      this.dialog = true
      this.$nextTick(() => {
        this.$refs.teacherDatePicker.dates = this.editedItem.inappropriateDates
      })

    },

    async deleteItem(item) {
      this.editedIndex = this.teachers.indexOf(item)
      await this.setEditedItem()
      this.dialogDelete = true
    },

    async deleteItemConfirm() {
      this.$socket.emit('sendDeleteTeacher', { id: this.editedItem._id });
      this.closeDelete()
    },

    close() {
      this.dialog = false
    },
    closeDelete() {
      this.dialogDelete = false
    },

    async save() {
      let teacher = {
        name: this.editedItem.name,
        inappropriateDates: Object.assign([], this.editedItem.inappropriateDates)
      }
      if (this.editedIndex > -1) {
        this.$socket.emit('sendUpdateTeacher', { id: this.editedItem._id, teacher: teacher });
      } else {
        this.$socket.emit('sendCreateTeacher', { teacher: teacher });
      }
      this.close()
    },
    setupSocketListeners() {
      this.$socket.on('updateTeacher', async (obj) => {
        const index = this.teachers.findIndex(teacher => teacher._id === obj.id);
        if (index !== -1) {
          this.$set(this.teachers, index, obj.teacher);
        }
      })
      this.$socket.on('createTeacher', async (obj) => {
        this.teachers.push(obj.teacher);
      })
      this.$socket.on('deleteTeacher', async (obj) => {
        if (obj.error) {
          console.log(obj.error)
        }
        else {
          const index = this.teachers.findIndex(teacher => teacher._id === obj.id);
          if (index !== -1) {
            this.teachers.splice(index, 1);
          }
        }
      })
    }

  }
}

</script>

<style></style>