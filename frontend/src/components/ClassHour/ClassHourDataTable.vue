<template>
    <v-data-table
        :headers="headers"
        :items="classHours"
        class="elevation-1" 
    >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title>Class Hours</v-toolbar-title>
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
              New Class Hour
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-text-field
                  v-model.number="editedItem.number"
                  label="Course number"
                ></v-text-field>
                <v-combobox
                    v-model="editedItem.class"
                    label="Class"
                    :items="allClasses"
                    item-text="name"
              ></v-combobox>
              <v-combobox
                    v-model="editedItem.teacher"
                    label="Teacher"
                    :items="allTeachers"
                    item-text="name"
              ></v-combobox>
              <v-combobox
                    v-model="editedItem.subject"
                    label="Subject"
                    :items="allSubjects"
                    item-text="name"
              ></v-combobox>
              <v-text-field
                  v-model.number="editedItem.weight"
                  label="Course hour weight"
                ></v-text-field>
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
import axios from 'axios'

export default {
    data () {
        return {
            dialog: false,
            dialogDelete: false,
            headers: [ 
                {text: 'Number', value: 'number'},
                {text: 'Class', value: 'class'},
                {text: 'Teacher', value: 'teacher'},  
                {text: 'Subject', value: 'subject'}, 
                {text: 'Weight', value: 'weight'},
                {text: 'Actions', value: 'actions', sortable: false}
            ],
            allClasses: [],
            allTeachers: [],
            allSubjects: [],
            classHours: [],
            editedIndex: -1,
            editedItem: {
              _id: '',  
              number: null,
              class:  null,
              teacher: null,
              subject: null,
              weight: 1
            },
        }
    },
    
    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'New Class Hour' : 'Edit Class Hour'
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
      this.fetchClassHours()
    },

    methods: {
      async fetchClassHours() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/classHour')
          .catch(error => console.log(error))
          this.classHours = response.data.data
        },
      async fetchClassHour() {
        let response = await axios
            .get('http://127.0.0.1:3000/api/classHour/' + this.classHours[this.editedIndex]._id)
            .catch(error => console.log(error))
            this.editedItem = response.data.data
      },
      async fetchClasses() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/class')
          .catch(error => console.log(error))
          this.allClasses = response.data.data
        },
      async fetchTeachers() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/teacher')
          .catch(error => console.log(error))
          this.allTeachers = response.data.data
        },
      async fetchSubjects() {
          let response = await axios.
          get('http://127.0.0.1:3000/api/subject')
          .catch(error => console.log(error))
          this.allSubjects = response.data.data
        },
        async editItem (item) {
            console.log(this.classHours)
          await this.fetchClasses()
          await this.fetchTeachers()
          await this.fetchSubjects()
          this.editedIndex = this.classHours.indexOf(item)
          if(this.editedIndex !== -1) {
            await this.fetchClassHour()
          } else {
            this.editedItem.name = ''
          }
          this.dialog = true
      },

      async deleteItem (item) {
        this.editedIndex = this.classHours.indexOf(item)
        await this.fetchClassHour()
        this.dialogDelete = true
      },

      async deleteItemConfirm () {
        await axios
          .delete('http://127.0.0.1:3000/api/classHour/' + this.editedItem._id)
          .catch(error => console.log(error))
        await this.fetchClassHours()
        this.closeDelete()
      },

      close () {
        this.dialog = false
      },  
      closeDelete () {
        this.dialogDelete = false
      },

      async save () {
        let classHour = {
            number: this.editedItem.number,
            class:  this.editedItem.class,
            teacher: this.editedItem.teacher,
            subject: this.editedItem.subject,
            weight: this.editedItem.weight
        }
        if (this.editedIndex > -1) {
          await axios.
          put('http://127.0.0.1:3000/api/classHour/' + this.classHours[this.editedIndex]._id, classHour)
          .catch(error => console.log(error))
        } else {
          await axios.
          post('http://127.0.0.1:3000/api/classHour', classHour)
          .catch(error => console.log(error))
        }
        await this.fetchClassHours()
        this.close()
      }
    }
}

</script>

<style>

</style>