import type { SubjectData } from './subject.type';
import { socket } from '@/modules/app/app.socket'
import { listen } from '@/modules/app/socket.listeners'

export const setupSubjectSocketListeners = (
  subjects: Ref<SubjectData[]>
) => listen({
  updateSubject: (obj) => {
    const index = subjects.value.findIndex(item => item._id === obj.id);
    if (index !== -1) {
      subjects.value[index] = obj.subject
    }
  },

  createSubject: (obj) => {
    subjects.value.push(obj.subject);
  },

  deleteSubject: (obj) => {
    if (obj.error) {
      console.log(obj.error)
      return
    }

    const index = subjects.value.findIndex(item => item._id === obj.id);
    if (index !== -1) {
      subjects.value.splice(index, 1);
    }
  },
});

export const emitCreateSubject = (subjectData: Partial<SubjectData>) => {
  socket.emit('sendCreateSubject', { subject: subjectData });
};

export const emitUpdateSubject = (id: string, subjectData: Partial<SubjectData>) => {
  socket.emit('sendUpdateSubject', { id, subject: subjectData });
};

export const emitDeleteSubject = (id: string) => {
  socket.emit('sendDeleteSubject', { id });
};
