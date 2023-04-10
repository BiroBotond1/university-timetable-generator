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
              New Item
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
                <v-data-table
    :items-per-page="-1"
    hide-default-footer
    :headers="headersToDatePicker"
    :items="items"
    class="border">
        <template v-slot:[`item.monday`]="{ item }"> 
            <v-btn
            @click="chooseItem(item.hours, 0)" 
            v-bind:color="editedItem.reservedDates[item.hours][0] === 0 ? 'green':'red' " 
            >
        </v-btn>
        </template>
        <template v-slot:[`item.tuesday`]="{ item }"> 
            <v-btn
            @click="chooseItem(item.hours, 1)"
            v-bind:color="editedItem.reservedDates[item.hours][1] === 0 ? 'green':'red' " 
        >   
            </v-btn>
        </template>
        <template v-slot:[`item.wednesday`]="{ item }"> 
            <v-btn
            @click="chooseItem(item.hours, 2)" 
            v-bind:color="editedItem.reservedDates[item.hours][2] === 0 ? 'green':'red' " 
        >   
            </v-btn>
        </template>
        <template v-slot:[`item.thursday`]="{ item }"> 
            <v-btn
            @click="chooseItem(item.hours, 3)" 
            v-bind:color="editedItem.reservedDates[item.hours][3] === 0 ? 'green':'red' " 
        >   
            </v-btn>
        </template>
        <template v-slot:[`item.friday`]="{ item }"> 
            <v-btn
            @click="chooseItem(item.hours, 4)" 
            v-bind:color="editedItem.reservedDates[item.hours][4] === 0 ? 'green':'red' " 
        >   
            </v-btn>
        </template>
    </v-data-table>
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
import Vue from 'vue'

export default {
    data () {
        return {
            dialog: false,
            defaultReservedDates: {
              "8-9": [0, 0, 0, 0, 0],
              "9-10": [0, 0, 0, 0, 0],
              "10-11": [0, 0, 0, 0, 0],
              "11-12": [0, 0, 0, 0, 0],
              "12-13": [0, 0, 0, 0, 0],
              "13-14": [0, 0, 0, 0, 0],
              "14-15": [0, 0, 0, 0, 0],
              "15-16": [0, 0, 0, 0, 0]
            },
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
              reservedDates:  {
              "8-9": [0, 0, 0, 0, 0],
              "9-10": [0, 0, 0, 0, 0],
              "10-11": [0, 0, 0, 0, 0],
              "11-12": [0, 0, 0, 0, 0],
              "12-13": [0, 0, 0, 0, 0],
              "13-14": [0, 0, 0, 0, 0],
              "14-15": [0, 0, 0, 0, 0],
              "15-16": [0, 0, 0, 0, 0]
            }
            },
            defaultItem: {
                _id: '',  
                name: '',
                reservedDates:  {
              "8-9": [0, 0, 0, 0, 0],
              "9-10": [0, 0, 0, 0, 0],
              "10-11": [0, 0, 0, 0, 0],
              "11-12": [0, 0, 0, 0, 0],
              "12-13": [0, 0, 0, 0, 0],
              "13-14": [0, 0, 0, 0, 0],
              "14-15": [0, 0, 0, 0, 0],
              "15-16": [0, 0, 0, 0, 0]
            }
            },
            headersToDatePicker: [
            {text: "Hours", value: "hours"},
            {text: "Monday", value: "monday"},
            {text: "Tuesday", value: "tuesday"},
            {text: "Wednesday", value: "wednesday"},
            {text: "Thursday", value: "thursday"},
            {text: "Friday", value: "friday"},
        ],
        items: [
            {hours: "8-9"},
            {hours: "9-10"},
            {hours: "10-11"},
            {hours: "12-13"},
            {hours: "13-14"},
            {hours: "14-15"},
            {hours: "15-16"}
        ],
        active: true
        }
    },
    
    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
      },
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
      fetchLocations() {
          axios.
          get('http://127.0.0.1:3000/api/location')
          .catch(error => console.log(error))
          .then(response => {
            this.locations = response.data.data
          })
        },
      fetchLocation() {
        axios
            .get('http://127.0.0.1:3000/api/location/' + this.locations[this.editedIndex]._id)
            .catch(error => console.log(error))
            .then(response => {
            this.editedItem = response.data.data
            })
      },
        editItem (item) {
          this.editedIndex = this.locations.indexOf(item)
          if(this.editedIndex !== -1) {
            this.fetchLocation()
          } else {
            this.editedItem.name = ''
            this.editedItem.reservedDates = {
              "8-9": [0, 0, 0, 0, 0],
              "9-10": [0, 0, 0, 0, 0],
              "10-11": [0, 0, 0, 0, 0],
              "11-12": [0, 0, 0, 0, 0],
              "12-13": [0, 0, 0, 0, 0],
              "13-14": [0, 0, 0, 0, 0],
              "14-15": [0, 0, 0, 0, 0],
              "15-16": [0, 0, 0, 0, 0]
            }
          }
          this.dialog = true
      },

      deleteItem (item) {
        this.editedIndex = this.locations.indexOf(item)
        this.fetchLocation()
        this.dialogDelete = true
      },

      deleteItemConfirm () {
        axios.
        delete('http://127.0.0.1:3000/api/location/' + this.editedItem._id)
          .catch(error => console.log(error))
          .then(() => {
            this.fetchLocations()
          })
        this.closeDelete()
      },

      close () {
        this.dialog = false
        this.editedIndex = -1
      },  
      closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      save () {
        let location = {
          name: this.editedItem.name,
          reservedDates: Object.assign({}, this.editedItem.reservedDates)
        }
        if (this.editedIndex > -1) {
          axios.
          put('http://127.0.0.1:3000/api/location/' + this.locations[this.editedIndex]._id, location)
          .catch(error => console.log(error))
          .then(() => {
            this.fetchLocations()
          })
          Object.assign(this.locations[this.editedIndex], this.editedItem)
        } else {
          axios.
          post('http://127.0.0.1:3000/api/location', location)
          .catch(error => console.log(error))
          .then(() => {
            this.fetchLocations()
          })
        }
        this.close()
      },
      chooseItem (hour, day) {
            if( this.editedItem.reservedDates[hour][day] === 0)
            {
                Vue.set(this.editedItem.reservedDates[hour], day, 1);
            } else {
                Vue.set(this.editedItem.reservedDates[hour], day, 0);
            }
      },
    }
}

</script>

<style>

</style>