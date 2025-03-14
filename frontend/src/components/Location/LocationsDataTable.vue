<template>
  <v-data-table :headers="headers" :items="locations" class="elevation-1">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Locations</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="800px">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" dark class="mb-2" v-bind="props" @click="editItem(undefined)">
              New Location
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-text-field v-model="editedItem.name" label="Location name"></v-text-field>
                <DatePicker ref="locationDatePicker" />
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
    <template v-slot:[`item.reservedDates`]="{ item }">
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
        { text: 'Reserved Dates', value: 'reservedDates' },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      locations: [],
      editedIndex: -1,
      editedItem: {
        _id: '',
        name: '',
        reservedDates: []
      },
    }
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Location' : 'Edit Location'
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
    await this.fetchLocations()
    this.setupSocketListeners()
  },

  methods: {
    async fetchLocations() {
      try {
        const response = await fetchService.fetchWithAuth('locations')
        const locations = await response.json()
        this.locations = locations.data
      }
      catch (error) {
        console.log(error)
      }
    },
    async setEditedItem() {
      this.editedItem = this.locations[this.editedIndex];
    },
    async editItem(item) {
      this.editedIndex = this.locations.indexOf(item)
      if (this.editedIndex !== -1) {
        await this.setEditedItem()
      } else {
        this.editedItem.name = ''
        this.editedItem.reservedDates = [
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0]
        ]
      }
      this.dialog = true
      this.$nextTick(() => {
        this.$refs.locationDatePicker.dates = this.editedItem.reservedDates
      })
    },

    async deleteItem(item) {
      this.editedIndex = this.locations.indexOf(item)
      await this.setEditedItem()
      this.dialogDelete = true
    },

    async deleteItemConfirm() {
      this.$socket.emit('sendDeleteLocation', { id: this.editedItem._id });
      this.closeDelete()
    },

    close() {
      this.dialog = false
    },
    closeDelete() {
      this.dialogDelete = false
    },

    async save() {
      let location = {
        name: this.editedItem.name,
        reservedDates: Object.assign([], this.editedItem.reservedDates)
      }
      if (this.editedIndex > -1) {
        this.$socket.emit('sendUpdateLocation', { id: this.editedItem._id, location: location });
      } else {
        this.$socket.emit('sendCreateLocation', { location: location });
      }
      this.close()
    },

    setupSocketListeners() {
      this.$socket.on('updateLocation', async (obj) => {
        const index = this.locations.findIndex(location => location._id === obj.id);
        if (index !== -1) {
          this.$set(this.locations, index, obj.location);
        }
      })
      this.$socket.on('createLocation', async (obj) => {
        this.locations.push(obj.location);
      })
      this.$socket.on('deleteLocation', async (obj) => {
        if (obj.error) {
          console.log(obj.error)
        }
        else {
          const index = this.locations.findIndex(location => location._id === obj.id);
          if (index !== -1) {
            this.locations.splice(index, 1);
          }
        }
      })
    }
  }
}

</script>

<style></style>