<template>
    <v-data-table
        :headers="headers"
        :items="locations"
        class="elevation-1" 
    >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title>Locations</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-dialog
          v-model="dialog"
          max-width="800px"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              color="primary"
              dark
              class="mb-2"
              v-bind="props"
              @click="editItem(undefined)"
            >
              New Location
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-text-field
                  v-model="editedItem.name"
                  label="Location name"
                ></v-text-field>
               <DatePicker  ref="locationDatePicker"/>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="close"
              >
                Cancel
              </v-btn>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="save"
              >
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
              <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:[`item.actions`]="{ item }">
      <v-icon
        size="medium"
        class="me-2"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>
      <v-icon
        size="medium"
        @click="deleteItem(item)"
      >
        mdi-delete
      </v-icon>
    </template>
    </v-data-table>
</template>

<script>
import axios from 'axios'
import DatePicker from '../DatePicker.vue'

export default {
    data () {
        return {
            dialog: false,
            dialogDelete: false,
            headers: [ 
                {text: 'Name', value: 'name',},
                {text: 'Reserved Dates', value: 'reservedDates'}, 
                {text: 'Actions', value: 'actions', sortable: false}
            ],
            locations: [],
            editedIndex: -1,
            editedItem: {
              _id: '',  
              name: '',
              reservedDates:  []
            },
        }
    },
    
    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'New Location' : 'Edit Location'
      },
    },

    components: {
      DatePicker: DatePicker
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },

    created () {
      this.fetchLocations()
    },

    methods: {
      async fetchLocations() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/location')
          .catch(error => console.log(error))
          this.locations = response.data.data
        },
        async fetchLocation() {
        let response = await axios
            .get('http://127.0.0.1:3000/api/location/' + this.locations[this.editedIndex]._id)
            .catch(error => console.log(error))
            this.editedItem = response.data.data
      },
        async editItem (item) {
          this.editedIndex = this.locations.indexOf(item)
          if(this.editedIndex !== -1) {
            await this.fetchLocation()
          } else {
            this.editedItem.name = ''
            this.editedItem.reservedDates =  [
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

      async deleteItem (item) {
        this.editedIndex = this.locations.indexOf(item)
        await this.fetchLocation()
        this.dialogDelete = true
      },

      async deleteItemConfirm () {
        await axios
          .delete('http://127.0.0.1:3000/api/location/' + this.editedItem._id)
          .catch(error => console.log(error))
        await this.fetchLocations()
        this.closeDelete()
      },

      close () {
        this.dialog = false
      },  
      closeDelete () {
        this.dialogDelete = false
      },

      async save () {
        let location = {
          name: this.editedItem.name,
          reservedDates: Object.assign([], this.editedItem.reservedDates)
        }
        if (this.editedIndex > -1) {
          await axios.
          put('http://127.0.0.1:3000/api/location/' + this.locations[this.editedIndex]._id, location)
          .catch(error => console.log(error))
        } else {
          await axios.
          post('http://127.0.0.1:3000/api/location', location)
          .catch(error => console.log(error))
        }
        await this.fetchLocations()
        this.close()
      }
    }
}

</script>

<style>

</style>