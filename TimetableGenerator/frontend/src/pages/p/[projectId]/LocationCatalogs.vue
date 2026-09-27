<template>
  <div app>
    <v-navigation-drawer color="highlight" permanent location="right">
      <v-list dense nav>
        <v-list-item
          v-for="item in locations"
          :key="item._id"
          :class="{ 'bg-selected-sidebar': item._id === locationId }"
          @click="selectLocation(item._id)"
          :title="item.name"
        >
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <div ref="locationCatalogRef">
      <CatalogDataTable v-if="catalog" :catalog="catalog"/>
    </div>
    <ColorsLabel :show-location="false" />
    <v-btn class="mt-2" color="primary" block @click="printComponent(locationCatalogRef)">
      Print
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import type { LocationData } from "@/modules/location/location.type";
import { fetchLocations } from "@/modules/location/location.api";
import { printComponent } from "@/modules/app/app.print";
const locationCatalogRef = ref<ComponentPublicInstance | null>(null);

const locations = ref<LocationData[]>([]);
const locationId = ref<string | undefined>();

onBeforeMount(async () => {
  locations.value = await fetchLocations();
  locations.value = locations.value.sort((a, b) => a.name.localeCompare(b.name))
  if (locations.value.length > 0) {
    selectLocation(locations.value[0]._id);
  }
});

const selectLocation = (id: string) => {
  locationId.value = id;
};

const selectedLocation = computed(() => {
  return locations.value.find(location => location._id === locationId.value)
})

const catalog = computed(() => {
  return selectedLocation.value?.catalog
})
</script>