import type { LocationData } from './location.type';
import { socket } from '@/modules/app/app.socket'
import { listen } from '@/modules/app/socket.listeners'

export const setupLocationSocketListeners = (
  locations: Ref<LocationData[]>
) => listen({
  updateLocation: (obj) => {
    const index = locations.value.findIndex(item => item._id === obj.id);
    if (index !== -1) {
      locations.value[index] = obj.location
    }
  },

  createLocation: (obj) => {
    locations.value.push(obj.location);
  },

  deleteLocation: (obj) => {
    if (obj.error) {
      console.log(obj.error)
      return
    }

    const index = locations.value.findIndex(item => item._id === obj.id);
    if (index !== -1) {
      locations.value.splice(index, 1);
    }
  },
});

export const emitCreateLocation = (locationData: Partial<LocationData>) => {
  socket.emit('sendCreateLocation', { location: locationData });
};

export const emitUpdateLocation = (id: string, locationData: Partial<LocationData>) => {
  socket.emit('sendUpdateLocation', { id, location: locationData });
};

export const emitDeleteLocation = (id: string) => {
  socket.emit('sendDeleteLocation', { id });
};
