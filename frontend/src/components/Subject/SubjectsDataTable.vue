<template>
  <v-data-table :headers="headers" :items="subjects" class="elevation-1">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Subjects</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="800px">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" dark class="mb-2" v-bind="props" @click="editItem(undefined)">
              New Subject
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-text-field v-model="editedItem.name" label="Subject name"></v-text-field>
                <v-combobox v-model="editedItem.locations" label="Locations" :items="allLocations" item-text="name"
                  multiple></v-combobox>

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
    <template v-slot:[`item.locations`]="{ item }">
      <v-label v-for="location in item.locations" :key="location._id">
        [{{ location.name }}]
      </v-label>
    </template>
  </v-data-table>
</template>

<script>

export default {
  data() {
    return {
      dialog: false,
      dialogDelete: false,
      headers: [
        { text: 'Name', value: 'name', },
        { text: 'Locations', value: "locations" },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      subjects: [],
      allLocations: [],
      editedIndex: -1,
      editedItem: {
        _id: '',
        name: '',
        locations: []
      },
    }
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Subject' : 'Edit Subject'
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

  created() {
    this.fetchSubjects()
    this.setupSocketListeners()
  },

  methods: {
    async fetchLocations() {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/locations')
        const locations = await response.json();
        this.allLocations = locations.data;
      }
      catch (error) {
        console.log(error)
      }
    },
    async fetchSubjects() {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/subjects')
        const subjects = await response.json();
        this.subjects = subjects.data
      }
      catch (error) {
        console.log(error)
      }
    },
    async setEditedItem() {
      this.editedItem = this.subjects[this.editedIndex];
    },
    async editItem(item) {
      await this.fetchLocations()
      this.editedIndex = this.subjects.indexOf(item)
      if (this.editedIndex !== -1) {
        await this.setEditedItem()
      } else {
        this.editedItem.name = ''
        this.editedItem.locations = []
      }
      this.dialog = true
    },

    async deleteItem(item) {
      this.editedIndex = this.subjects.indexOf(item)
      await this.setEditedItem()
      this.dialogDelete = true
    },

    async deleteItemConfirm() {
      this.$socket.emit('sendDeleteSubject', { id: this.editedItem._id });
      this.closeDelete()
    },

    close() {
      this.dialog = false
    },
    closeDelete() {
      this.dialogDelete = false
    },

    async save() {
      let subject = {
        name: this.editedItem.name,
        locations: this.editedItem.locations
      }
      if (this.editedIndex > -1) {
        this.$socket.emit('sendUpdateSubject', { id: this.editedItem._id, subject: subject });
      } else {
        this.$socket.emit('sendCreateSubject', { subject: subject });
      }
      this.close()
    },
    setupSocketListeners() {
      this.$socket.on('updateSubject', async (obj) => {
        const index = this.subjects.findIndex(subject => subject._id === obj.id);
        if (index !== -1) {
          this.$set(this.subjects, index, obj.subject);
        }
      })
      this.$socket.on('createSubject', async (obj) => {
        this.subjects.push(obj.subject);
      })
      this.$socket.on('deleteSubject', async (obj) => {
        if (obj.error) {
          console.log(obj.error)
        }
        else {
          const index = this.subjects.findIndex(subject => subject._id === obj.id);
          if (index !== -1) {
            this.subjects.splice(index, 1);
          }
        }
      })
    }
  }
}

</script>

<style></style>