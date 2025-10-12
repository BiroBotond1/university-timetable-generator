<template>
  <h1 class="title">Register</h1>
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

    <v-text-field
      v-model="password2"
      :counter="20"
      label="Password again"
      required
      :type="showPassword2 ? 'text' : 'password'"
      append-icon="mdi-eye"
      @click:append="showPassword2 = !showPassword2"
    ></v-text-field>

    <div class="button-container">
      <v-btn
        class="mr-4"
        @click="submit"
      >
        Register
      </v-btn>
      <v-btn class="login" @click="login">
        Go to Login
      </v-btn>
    </div>
  </form>
</template>

<script setup lang="ts">
  // import { validationMixin } from '@vuelidate/core'
  // import { required, maxLength, minLength } from '@vuelidate/validators'
import fetchService from '@/modules/app/fetch.service';
import { defineComponent } from 'vue';

// Components
import Sidebar from '../components/SideBar.vue'

  // export default defineComponent({
  //   mixins: [validationMixin],

  //   validations: {
  //     username: { required, maxLength: maxLength(20) },
  //     password: { required, maxLength: maxLength(20), minLength: minLength(6) },
  //     password2: { 
  //       required, 
  //       maxLength: maxLength(20),
  //       minLength: minLength(6),
  //       sameAsPassword: function (value) {
  //         return value === this.password;
  //       },
  //     }
  //   },

const username = ref('')
const password = ref('')
const password2 = ref('')
const showPassword = ref(false)
const showPassword2 = ref(false)
const router = useRouter();


    // computed: {
    //   nameErrors () {
    //     const errors = []
    //     if (!this.$v.username.$dirty) {
    //       return errors
    //     } 
    //     !this.$v.username.maxLength && errors.push('Name must be at most 20 characters long')
    //     !this.$v.username.required && errors.push('Name is required.')
    //     return errors
    //   },
    //   passwordErrors () {
    //     const errors = []
    //     if (!this.$v.password.$dirty) {
    //       return errors
    //     } 

    //     !this.$v.password.maxLength && errors.push('Password must be at most 20 characters long')
    //     !this.$v.password.minLength && errors.push('Password must be at least 6 characters long')
    //     !this.$v.password.required && errors.push('Password is required')
    //     return errors
    //   },
    //   password2Errors () {
    //     const errors = []
    //     if (!this.$v.password2.$dirty) {
    //       return errors
    //     } 

    //     !this.$v.password2.maxLength && errors.push('Password must be at most 20 characters long')
    //     !this.$v.password2.minLength && errors.push('Password must be at least 6 characters long')
    //     !this.$v.password2.required && errors.push('Password is required')
    //     !this.$v.password2.sameAsPassword &&  errors.push('Passwords do not match.')
    //     return errors
    //   },
    // },

const submit = async () => {
  // this.$v.$touch()
  // if (this.$v.$invalid) {
  //   return;
  // }
  
  console.log(JSON.stringify({username: username.value, password: password.value}))

  const response = await fetchService.fetch('register', {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    },
    body: JSON.stringify({username: username.value, password: password.value})
  });
  
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const json = await response.json();
  console.log(json);

  router.push('/login');
}

const login = () => {
  router.push('/login');
}

const clear = () => {
 // this.$v.$reset()
  username.value = ''
  password.value = ''
  password2.value = ''
}
  
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