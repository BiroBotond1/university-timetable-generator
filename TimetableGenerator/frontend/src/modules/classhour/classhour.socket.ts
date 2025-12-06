import type { ClassHourData, PopulatedClassHourData } from './classhour.type';
import { socket } from '@/modules/app/app.socket'

export const setupClassHourSocketListeners = (
  classHours: Ref<PopulatedClassHourData[]>
) => {
  socket.on('updateClassHour', async (obj) => {
    const index = classHours.value.findIndex(classHour => classHour._id === obj.id);
    if (index !== -1) {
      classHours.value[index] = obj.classHour
    }
  })
  socket.on('createClassHour', async (obj) => {
    classHours.value.push(obj.classHour);
  })
  socket.on('deleteClassHour', async (obj) => {
    if (obj.error) {
      console.log(obj.error)
    }
    else {
      const index = classHours.value.findIndex(classHour => classHour._id === obj.id);
      if (index !== -1) {
        classHours.value.splice(index, 1);
      }
    }
  })
};

export const emitCreateClassHour = (classHourData: Partial<ClassHourData>) => {
  socket.emit('sendCreateClassHour', { classHour: classHourData });
};

export const emitUpdateClassHour = (id: string, classHourData: Partial<ClassHourData>) => {
  socket.emit('sendUpdateClassHour', { id, classHour: classHourData });
};

export const emitDeleteClassHour = (id: string) => {
  socket.emit('sendDeleteClassHour', { id });
};
