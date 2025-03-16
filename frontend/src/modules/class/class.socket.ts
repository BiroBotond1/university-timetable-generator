import type { ClassData } from '@/modules/class/class.type';
import { socket } from '@/modules/app/app.socket'

export const setupClassSocketListeners = (
  classes: Ref<ClassData[]>
) => {
  socket.on('updateClass', async (obj) => {
    const index = classes.value.findIndex(classs => classs._id === obj.id);
    if (index !== -1) {
      classes.value[index] = obj.class;
    }
  });

  socket.on('createClass', async (obj) => {
    classes.value.push(obj.class);
  });

  socket.on('deleteClass', async (obj) => {
    if (obj.error) {
      console.log(obj.error);
    } else {
      const index = classes.value.findIndex(classs => classs._id === obj.id);
      if (index !== -1) {
        classes.value.splice(index, 1);
      }
    }
  });
};

export const emitCreateClass = (classData: Partial<ClassData>) => {
  socket.emit('sendCreateClass', { class: classData });
};

export const emitUpdateClass = (id: string, classData: Partial<ClassData>) => {
  socket.emit('sendUpdateClass', { id, class: classData });
};

export const emitDeleteClass = (id: string) => {
  socket.emit('sendDeleteClass', { id });
};
