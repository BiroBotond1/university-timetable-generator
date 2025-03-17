import type { LocationData } from './location.type';
import { socket } from '@/modules/app/app.socket'

export const setupLocationSocketListeners = (
  locations: Ref<LocationData[]>
) => {
  socket.on('updateLocation', async (obj) => {
    const index = locations.value.findIndex(location => location._id === obj.id);
    if (index !== -1) {
      locations.value[index] = obj.location
    }
  })
  socket.on('createLocation', async (obj) => {
    locations.value.push(obj.location);
  })
  socket.on('deleteLocation', async (obj) => {
    if (obj.error) {
      console.log(obj.error)
    }
    else {
      const index = locations.value.findIndex(location => location._id === obj.id);
      if (index !== -1) {
        locations.value.splice(index, 1);
      }
    }
  })
};

export const emitCreateLocation = (locationData: Partial<LocationData>) => {
  socket.emit('sendCreateLocation', { location: locationData });
};

export const emitUpdateLocation = (id: string, locationData: Partial<LocationData>) => {
  socket.emit('sendUpdateLocation', { id, location: locationData });
};

export const emitDeleteLocation = (id: string) => {
  socket.emit('sendDeleteLocation', { id });
};
