import type { TeacherData } from './teacher.type';
import { socket } from '@/modules/app/app.socket'
import { listen } from '@/modules/app/socket.listeners'

export const setupTeacherSocketListeners = (
  teachers: Ref<TeacherData[]>
) => listen({
  updateTeacher: (obj) => {
    const index = teachers.value.findIndex(item => item._id === obj.id);
    if (index !== -1) {
      teachers.value[index] = obj.teacher
    }
  },

  createTeacher: (obj) => {
    teachers.value.push(obj.teacher);
  },

  deleteTeacher: (obj) => {
    if (obj.error) {
      console.log(obj.error)
      return
    }

    const index = teachers.value.findIndex(item => item._id === obj.id);
    if (index !== -1) {
      teachers.value.splice(index, 1);
    }
  },
});

export const emitCreateTeacher = (teacherData: Partial<TeacherData>) => {
  socket.emit('sendCreateTeacher', { teacher: teacherData });
};

export const emitUpdateTeacher = (id: string, teacherData: Partial<TeacherData>) => {
  socket.emit('sendUpdateTeacher', { id, teacher: teacherData });
};

export const emitDeleteTeacher = (id: string) => {
  socket.emit('sendDeleteTeacher', { id });
};
