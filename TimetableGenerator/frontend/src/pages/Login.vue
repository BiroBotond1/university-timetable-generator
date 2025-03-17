<template>
  <h1 class="title">Login</h1>
  <form class="pa-4">
    <v-text-field
      v-model="username"

      :counter="20"
      label="Name"
      required
    ></v-text-field>
    <v-text-field
      v-model="password"

      :counter="20"
      label="Password"
      required
      :type="showPassword ? 'text' : 'password'"
      append-icon="mdi-eye"
      @click:append="showPassword = !showPassword"
    ></v-text-field>

    <div class="button-container">
      <v-btn
        class="mr-4"

        @click="login"
      >
        Login
      </v-btn>
      <v-btn class="register" @click="register">
        register
      </v-btn>
    </div>
  </form>
</template>

<script setup lang="ts">
 // import { useVuelidate } from '@vuelidate/core'
  //import { minLength, required, maxLength } from '@vuelidate/validators'
import { useRouter } from 'vue-router';
import fetchService from '@/modules/app/fetch.service';

  // Components
 // import Sidebar from '@/components/Side_bar.vue'

    // validations: {
    //   username: { required, maxLength: maxLength(20) },
    //   password: { required, maxLength: maxLength(20), minLength: minLength(6) }
    // },

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const router = useRouter();

async function login() {
  //this.$v.$touch()
  // if (this.$v.$invalid) {
  //   return;
  // }

  const response = await fetchService.fetch('login', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({username: username.value, password: password.value })
  });
  
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const json = await response.json();

  localStorage.setItem('token', json.token);

  router.push('/');
}

function register(): void {
  router.push('/register');
}
      // nameErrors () {
      //   const errors = []
      //   if (!this.$v.username.$dirty) {
      //     return errors
      //   } 
      //   !this.$v.username.maxLength && errors.push('Name must be at most 20 characters long')
      //   !this.$v.username.required && errors.push('Name is required.')
      //   return errors
      // },
      // },
      // passwordErrors () {
      //   const errors = []
      //   if (!this.$v.password.$dirty) {
      //     return errors
      //   } 

      //   !this.$v.password.maxLength && errors.push('Password must be at most 20 characters long')
      //   !this.$v.password.minLength && errors.push('Password must be at least 6 characters long')
      //   !this.$v.password.required && errors.push('Password is required')
      //   return errors
      // },
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