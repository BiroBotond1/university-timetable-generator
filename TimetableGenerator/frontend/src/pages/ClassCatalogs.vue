<template>
  <div app>
    <v-navigation-drawer color="highlight" permanent location="right">
      <v-list dense nav>
        <v-list-item v-for="item in classes" :key="item._id"
          :class="{ 'bg-selected-sidebar': item._id === classId }" @click="selectClass(item._id)"
          :title="item.name">
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <div ref="classCatalogRef" app>
      <div class="font-bold mb-5">
        Class Room: <span class="text-location">{{ classRoom }} </span>
      </div>
      <CatalogDataTable v-if="catalog" :catalog="catalog" />
    </div>
    <ColorsLabel :show-class="false"/>
    <v-btn class="mt-2" color="primary" block @click="printComponent(classCatalogRef)"> Print</v-btn>
  </div>
</template>


<script setup lang="ts">
import type { ClassData } from '@/modules/class/class.type';
import { fetchClasses } from '@/modules/class/class.api';
import { printComponent } from '@/modules/app/app.print';

const classes = ref<ClassData[]>([])
const classId = ref<string | undefined>()
const classCatalogRef = ref<ComponentPublicInstance | null>(null);

onMounted(async () => {
  classes.value = await fetchClasses()
  classes.value = classes.value.sort((a, b) => a.name.localeCompare(b.name))
  
  if (classes.value.length > 0) {
    selectClass(classes.value[0]._id)
  }
})

const selectClass = (id: string) => {
  classId.value = id
}

const selectedClass = computed(() => {
  return classes.value.find(clas => clas._id === classId.value)
})

const classRoom = computed(() => {
  return selectedClass.value?.location 
})

const catalog = computed(() => {
  return selectedClass.value?.catalog
})
</script>