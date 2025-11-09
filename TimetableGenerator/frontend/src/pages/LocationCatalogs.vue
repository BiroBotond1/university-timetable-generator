<template>
  <div>
    <v-navigation-drawer color="highlight" permanent location="right">
      <v-list dense nav>
        <v-list-item v-for="item in locations" :key="item._id" :class="{ active: item._id === locationId }"
          @click="selectLocation(item._id)" :title="item.name">
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <div class="flex" style="width: 100%">
      <div style="flex: 1; min-width: 0">
        <LocationCatalog ref="locationCatalogRef" v-model:id="locationId" />
      </div>

      <div class="color-container flex flex-column gap-y-4" style="flex: 0 0 auto; margin-left: 16px">
        <div class="flex">
          <div class="color-box bg-subject"></div>
          <div class="color-label">Subject</div>
        </div>
        <div class="flex">
          <div class="color-box bg-class"></div>
          <div class="color-label">Class</div>
        </div>
        <div class="flex">
          <div class="color-box bg-teacher"></div>
          <div class="color-label">Teacher</div>
        </div>
        <v-btn class="mt-1" color="primary" @click="printComponent(locationCatalogRef)">
          Print
        </v-btn>
      </div>
    </div>

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

<style>

.active {
  background: rgb(105, 105, 105);
}

.color-container {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.color-box {
  width: 18px;
  height: 18px;
  margin: 2px;
}

.color-label {
  margin-top: 2px;
  text-align: center;
  margin-right: 15px;
}
</style>
