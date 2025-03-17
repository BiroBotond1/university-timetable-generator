import type { TeacherData } from './teacher.type';
import { socket } from '@/modules/app/app.socket'

export const setupTeacherSocketListeners = (
  teachers: Ref<TeacherData[]>
) => {
  socket.on('updateTeacher', async (obj) => {
    const index = teachers.value.findIndex(teacher => teacher._id === obj.id);
    if (index !== -1) {
      teachers.value[index] = obj.teacher
    }
  })
  socket.on('createTeacher', async (obj) => {
    teachers.value.push(obj.teacher);
  })
  socket.on('deleteTeacher', async (obj) => {
    if (obj.error) {
      console.log(obj.error)
    }
    else {
      const index = teachers.value.findIndex(teacher => teacher._id === obj.id);
      if (index !== -1) {
        teachers.value.splice(index, 1);
      }
    }
  })
};

export const emitCreateTeacher = (teacherData: Partial<TeacherData>) => {
  socket.emit('sendCreateTeacher', { teacher: teacherData });
};

export const emitUpdateTeacher = (id: string, teacherData: Partial<TeacherData>) => {
  socket.emit('sendUpdateTeacher', { id, teacher: teacherData });
};

export const emitDeleteTeacher = (id: string) => {
  socket.emit('sendDeleteTeacher', { id });
};
