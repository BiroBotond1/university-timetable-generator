<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <Sidebar />
        <h1 class="title">Register</h1>
        <form class="pa-4">
          <v-text-field
            v-model="username"
            :error-messages="nameErrors"
            :counter="20"
            label="Name"
            required
            @input="$v.username.$touch()"
            @blur="$v.username.$touch()"
          ></v-text-field>
          <v-text-field
            v-model="password"
            :error-messages="passwordErrors"
            :counter="20"
            label="Password"
            required
            :type="showPassword ? 'text' : 'password'"
            @input="$v.password.$touch()"
            @blur="$v.password.$touch()"
            append-icon="mdi-eye"
            @click:append="showPassword = !showPassword"
          ></v-text-field>

          <v-text-field
            v-model="password2"
            :error-messages="password2Errors"
            :counter="20"
            label="Password again"
            required
            :type="showPassword2 ? 'text' : 'password'"
            @input="$v.password2.$touch()"
            @blur="$v.password2.$touch()"
            append-icon="mdi-eye"
            @click:append="showPassword2 = !showPassword2"
          ></v-text-field>

          <div class="button-container">
            <v-btn
              class="mr-4"
              :disabled="$v.$invalid"
              @click="submit"
            >
              Register
            </v-btn>
            <v-btn class="login" @click="login">
              Go to Login
            </v-btn>
          </div>
        </form>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
  import { validationMixin } from 'vuelidate'
  import { minLength } from 'vuelidate/lib/validators';
  import { required, maxLength } from 'vuelidate/lib/validators'
  import fetchService from '../../services/fetch.service.js';

  import { defineComponent } from 'vue';

  // Components
  import Sidebar from '../components/Side_bar.vue'

  export default defineComponent({
    mixins: [validationMixin],

    validations: {
      username: { required, maxLength: maxLength(20) },
      password: { required, maxLength: maxLength(20), minLength: minLength(6) },
      password2: { 
        required, 
        maxLength: maxLength(20),
        minLength: minLength(6),
        sameAsPassword: function (value) {
          return value === this.password;
        },
      }
    },

    components: {
    Sidebar,
    },

    data: () => ({
      username: '',
      password: '',
      password2: '',
      showPassword: false,
      showPassword2: false
    }),

    computed: {
      nameErrors () {
        const errors = []
        if (!this.$v.username.$dirty) {
          return errors
        } 
        !this.$v.username.maxLength && errors.push('Name must be at most 20 characters long')
        !this.$v.username.required && errors.push('Name is required.')
        return errors
      },
      passwordErrors () {
        const errors = []
        if (!this.$v.password.$dirty) {
          return errors
        } 

        !this.$v.password.maxLength && errors.push('Password must be at most 20 characters long')
        !this.$v.password.minLength && errors.push('Password must be at least 6 characters long')
        !this.$v.password.required && errors.push('Password is required')
        return errors
      },
      password2Errors () {
        const errors = []
        if (!this.$v.password2.$dirty) {
          return errors
        } 

        !this.$v.password2.maxLength && errors.push('Password must be at most 20 characters long')
        !this.$v.password2.minLength && errors.push('Password must be at least 6 characters long')
        !this.$v.password2.required && errors.push('Password is required')
        !this.$v.password2.sameAsPassword &&  errors.push('Passwords do not match.')
        return errors
      },
    },

    methods: {
      async submit  () {
        this.$v.$touch()
        if (this.$v.$invalid) {
          return;
        }
        
        console.log(JSON.stringify({username: this.username, password: this.password}))

        const response = await fetchService.fetch('register', {
          method: "POST",
          headers: {
          "Content-Type": "application/json",
          },
          body: JSON.stringify({username: this.username, password: this.password})
        });
        
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json);

        this.$router.push('/login');
      },
      login() {
        this.$router.push('/login');
      },
      clear () {
        this.$v.$reset()
        this.username = ''
        this.password = ''
        this.password2 = ''
      },
    },
  })
  
</script>

<style scoped>
.button-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.login {
  margin-left: auto;
}

.title {
  text-align: center;
}
</style>