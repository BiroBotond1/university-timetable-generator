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
    <LocationCatalog ref="locationCatalogRef" v-model:id="locationId" />
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

onMounted(async () => {
  locations.value = await fetchLocations();
  if (locations.value.length > 0) {
    selectLocation(locations.value[0]._id);
  }
});

const selectLocation = (id: string) => {
  locationId.value = id;
};
</script>