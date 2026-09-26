<template>
  <v-btn @click="setProject">
    Set project
  </v-btn>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAppStore } from "@/modules/app/app.store";

const router = useRouter();
const appStore = useAppStore()

onMounted(() => {
  appStore.projectId = null
});

const setProject = () => {
  appStore.projectId = "set";
  router.push({ name: "/Generate" })
}

</script>