import type { ClassHourData, PopulatedClassHourData } from './classhour.type';
import { socket } from '@/modules/app/app.socket'
import { listen } from '@/modules/app/socket.listeners'

export const setupClassHourSocketListeners = (
  classHours: Ref<PopulatedClassHourData[]>
) => listen({
  updateClassHour: (obj) => {
    const index = classHours.value.findIndex(classHour => classHour._id === obj.id);
    if (index !== -1) {
      classHours.value[index] = obj.classHour
    }
  },

  createClassHour: (obj) => {
    classHours.value.push(obj.classHour);
  },

  deleteClassHour: (obj) => {
    if (obj.error) {
      console.log(obj.error)
      return
    }

    const index = classHours.value.findIndex(classHour => classHour._id === obj.id);
    if (index !== -1) {
      classHours.value.splice(index, 1);
    }
  },
});

export const emitCreateClassHour = (classHourData: Partial<ClassHourData>) => {
  socket.emit('sendCreateClassHour', { classHour: classHourData });
};

export const emitUpdateClassHour = (id: string, classHourData: Partial<ClassHourData>) => {
  socket.emit('sendUpdateClassHour', { id, classHour: classHourData });
};

export const emitDeleteClassHour = (id: string) => {
  socket.emit('sendDeleteClassHour', { id });
};
