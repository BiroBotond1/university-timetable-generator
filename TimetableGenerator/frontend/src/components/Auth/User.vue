<template>
  <v-menu min-width="200px">
    <template v-slot:activator="{ props }">
      <v-btn icon v-bind="props">
        <v-avatar color="brown">
          <v-img v-if="user?.picture" alt="Avatar" :src="user.picture" />
          <span v-else class="text-h5">{{ user.name }}</span>
        </v-avatar>
      </v-btn>
    </template>
    <v-card>
      <v-card-text>
        <div class="mx-auto text-center">
          <v-avatar color="brown">
            <v-img v-if="user?.picture" alt="Avatar" :src="user?.picture"/>
            <span v-else class="text-h5">{{ user.name }}</span>
          </v-avatar>
          <h3>{{ user.nickname }}</h3>
          <p class="text-caption mt-1">
            {{ user.email }}
          </p>
          <v-divider class="my-3"></v-divider>
          <logout-button/>
        </div>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { useAuth0 } from "@auth0/auth0-vue";

const { user, isAuthenticated, isLoading, error } = useAuth0();

</script>