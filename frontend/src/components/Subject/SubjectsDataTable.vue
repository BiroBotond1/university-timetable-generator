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
      <v-toolbar-title>Subjects</v-toolbar-title>
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
            New Subject
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
                label="Subject name"
              ></v-text-field>
              <v-combobox
              v-model="editedItem.locations"
              label="Locations"
              :items="allLocations"
              item-text="name"
              multiple
              ></v-combobox>

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
  <template v-slot:[`item.locations`]="{ item }">
      <v-label v-for="location in item.locations" :key="location._id">
        [{{ location.name }}]
      </v-label>
</template>
  </v-data-table>
</template>

<script>
import axios from 'axios'

export default {
  data () {
      return {
          dialog: false,
          dialogDelete: false,
          headers: [ 
              {text: 'Name', value: 'name',},
              {text: 'Locations', value: "locations"}, 
              {text: 'Actions', value: 'actions', sortable: false}
          ],
          subjects: [],
          allLocations: [],
          editedIndex: -1,
          editedItem: {
            _id: '',  
            name: '',
            locations:  []
          },
      }
  },
  
  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'New Subject' : 'Edit Subject'
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
    this.fetchSubjects()
  },

  methods: {
    async fetchLocations() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/location')
          .catch(error => console.log(error))
          this.allLocations = response.data.data
        },
    async fetchSubjects() {
        let response = await axios.
        get('http://127.0.0.1:3000/api/subject')
        .catch(error => console.log(error))
        this.subjects = response.data.data
      },
      async fetchSubject() {
      let response = await axios
          .get('http://127.0.0.1:3000/api/subject/' + this.subjects[this.editedIndex]._id)
          .catch(error => console.log(error))
          this.editedItem = response.data.data
    },
      async editItem (item) {
        await this.fetchLocations()
        this.editedIndex = this.subjects.indexOf(item)
        if(this.editedIndex !== -1) {
          await this.fetchSubject()
        } else {
          this.editedItem.name = ''
          this.editedItem.locations = []
        }
        this.dialog = true
    },

    async deleteItem (item) {
      this.editedIndex = this.subjects.indexOf(item)
      await this.fetchSubject()
      this.dialogDelete = true
    },

    async deleteItemConfirm () {
      await axios
        .delete('http://127.0.0.1:3000/api/subject/' + this.editedItem._id)
        .catch(error => console.log(error))
      await this.fetchSubjects()
      this.closeDelete()
    },

    close () {
      this.dialog = false
    },  
    closeDelete () {
      this.dialogDelete = false
    },

    async save () {
      let subject = {
        name: this.editedItem.name,
        locations: this.editedItem.locations
      }
      if (this.editedIndex > -1) {
        await axios.
        put('http://127.0.0.1:3000/api/subject/' + this.subjects[this.editedIndex]._id, subject)
        .catch(error => console.log(error))
      } else {
        await axios.
        post('http://127.0.0.1:3000/api/subject', subject)
        .catch(error => console.log(error))
      }
      await this.fetchSubjects()
      this.close()
    }
  }
}

</script>

<style>

</style>