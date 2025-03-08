<template>
  <v-data-table :headers="headers" :items="classes" class="elevation-1">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Classes</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="800px">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" dark class="mb-2" v-bind="props" @click="editItem(undefined)">
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

<script>
import fetchService from '../../../services/fetch.service';

export default {
  data() {
    return {
      dialog: false,
      dialogDelete: false,
      headers: [
        { text: 'Name', value: 'name', },
        { text: 'Classroom', value: 'location', },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      classes: [],
      editedIndex: -1,
      editedItem: {
        _id: '',
        name: '',
        location: '',
      },
    }
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Class' : 'Edit Class'
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
    await this.fetchClasses()
    this.setupSocketListeners()
  },

  methods: {
    async fetchClasses() {
      try {
        const response = await fetchService.fetchWithAuth('classes')
        const classes = await response.json()
        this.classes = classes.data
      }
      catch (error) {
        console.log(error)
      }
    },
    async setEditedItem() {
      this.editedItem = this.classes[this.editedIndex]
    },
    async editItem(item) {
      this.editedIndex = this.classes.indexOf(item)
      if (this.editedIndex !== -1) {
        await this.setEditedItem()
      } else {
        this.editedItem.name = ''
        this.editedItem.location = ''
      }
      this.dialog = true
    },
    async deleteItem(item) {
      this.editedIndex = this.classes.indexOf(item)
      await this.setEditedItem()
      this.dialogDelete = true
    },

    async deleteItemConfirm() {
      this.$socket.emit('sendDeleteClass', { id: this.editedItem._id });
      this.closeDelete()
    },

    close() {
      this.dialog = false
    },
    closeDelete() {
      this.dialogDelete = false
    },

    async save() {
      let classs = {
        name: this.editedItem.name,
        location: this.editedItem.location
      }
      if (this.editedIndex > -1) {
        this.$socket.emit('sendUpdateClass', { id: this.editedItem._id, class: classs });
      } else {
        this.$socket.emit('sendCreateClass', { class: classs });
      }
      this.close()
    },
    setupSocketListeners() {
      this.$socket.on('updateClass', async (obj) => {
        const index = this.classes.findIndex(classs => classs._id === obj.id);
        if (index !== -1) {
          this.$set(this.classes, index, obj.class);
        }
      })
      this.$socket.on('createClass', async (obj) => {
        this.classes.push(obj.class);
      })
      this.$socket.on('deleteClass', async (obj) => {
        if (obj.error) {
          console.log(obj.error)
        }
        else {
          const index = this.classes.findIndex(classs => classs._id === obj.id);
          if (index !== -1) {
            this.classes.splice(index, 1);
          }
        }
      })
    }
  }
}

</script>

<style></style>