import type { SubjectData } from './subject.type';
import { socket } from '@/modules/app/app.socket'

export const setupSubjectSocketListeners = (
  subjects: Ref<SubjectData[]>
) => {
  socket.on('updateSubject', async (obj) => {
    const index = subjects.value.findIndex(subject => subject._id === obj.id);
    if (index !== -1) {
      subjects.value[index] = obj.subject
    }
  })
  socket.on('createSubject', async (obj) => {
    subjects.value.push(obj.subject);
  })
  socket.on('deleteSubject', async (obj) => {
    if (obj.error) {
      console.log(obj.error)
    }
    else {
      const index = subjects.value.findIndex(subject => subject._id === obj.id);
      if (index !== -1) {
        subjects.value.splice(index, 1);
      }
    }
  })
};

export const emitCreateSubject = (subjectData: Partial<SubjectData>) => {
  socket.emit('sendCreateSubject', { subject: subjectData });
};

export const emitUpdateSubject = (id: string, subjectData: Partial<SubjectData>) => {
  socket.emit('sendUpdateSubject', { id: id, subject: subjectData });
};

export const emitDeleteSubject = (id: string) => {
  socket.emit('sendDeleteSubject', { id });
};
