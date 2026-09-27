import type { ClassData } from '@/modules/class/class.type';
import { socket } from '@/modules/app/app.socket'
import { listen } from '@/modules/app/socket.listeners'

export const setupClassSocketListeners = (
  classes: Ref<ClassData[]>
) => listen({
  updateClass: (obj) => {
    const index = classes.value.findIndex(item => item._id === obj.id);
    if (index !== -1) {
      classes.value[index] = obj.class
    }
  },

  createClass: (obj) => {
    classes.value.push(obj.class);
  },

  deleteClass: (obj) => {
    if (obj.error) {
      console.log(obj.error)
      return
    }

    const index = classes.value.findIndex(item => item._id === obj.id);
    if (index !== -1) {
      classes.value.splice(index, 1);
    }
  },
});

export const emitCreateClass = (classData: Partial<ClassData>) => {
  socket.emit('sendCreateClass', { class: classData });
};

export const emitUpdateClass = (id: string, classData: Partial<ClassData>) => {
  socket.emit('sendUpdateClass', { id, class: classData });
};

export const emitDeleteClass = (id: string) => {
  socket.emit('sendDeleteClass', { id });
};
