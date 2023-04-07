<template>
    <v-data-table
        :headers="headers"
        :items="subjects"
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
              @click="editItem(item)"
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
                <DatePicker />
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
    <template v-slot:no-data>
      <v-btn
        color="primary"
        @click="initialize"
      >
        Reset
      </v-btn>
    </template>
    </v-data-table>
</template>

<script>
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
            subjects: [
                {name: "Kemia labor", reservedDates: ["Monday",]},
                {name: "Kemia", reservedDates: []}
            ],
            editedIndex: -1,
            editedItem: {
                name: '',
            },
            defaultItem: {
                name: '',
            },
        }
    },
    components: {
      DatePicker
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

    methods: {
        editItem (item) {
        this.editedIndex = this.subjects.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {
        this.editedIndex = this.subjects.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogDelete = true
      },

      deleteItemConfirm () {
        this.subjects.splice(this.editedIndex, 1)
        this.closeDelete()
      },

      close () {
        this.dialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },  
      closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      save () {
        if (this.editedIndex > -1) {
          Object.assign(this.subjects[this.editedIndex], this.editedItem)
        } else {
          this.subjects.push(this.editedItem)
        }
        this.close()
      },
    }
}

</script>

<style>

</style>