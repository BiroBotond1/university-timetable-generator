<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <Sidebar />
        <h1 class="title">Login</h1>
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

          <div class="button-container">
            <v-btn
              class="mr-4"
              :disabled="$v.$invalid"
              @click="login"
            >
              Login
            </v-btn>
            <v-btn class="register" @click="register">
              register
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
  import fetchService from '../../services/fetch.service'

  import { defineComponent } from 'vue';

  // Components
  import Sidebar from '../components/Side_bar.vue'

  export default defineComponent({
    mixins: [validationMixin],

    validations: {
      username: { required, maxLength: maxLength(20) },
      password: { required, maxLength: maxLength(20), minLength: minLength(6) }
    },

    components: {
    Sidebar,
    },

    data: () => ({
      username: '',
      password: '',
      showPassword: false
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
       compPassword () {
        try {
          if ( this.password.trim().startsWith('{')) {
            return JSON.parse(this.password);
          } else {
            return this.password;
          }    
      } catch {
        return this.password;
      }
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
    },

    methods: {
      async login () {
        this.$v.$touch()
        if (this.$v.$invalid) {
          return;
        }
      
        const response = await fetchService.fetch('login', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({username: this.username, password: this.compPassword})
        });
        
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();

        localStorage.setItem('token', json.token);

        this.$router.push('/');
      },
     register() {
      this.$router.push('/register');
     }
    },
  })

</script>

<style scoped>
.button-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.register {
  margin-left: auto;
}

.title {
  text-align: center;
}
</style>