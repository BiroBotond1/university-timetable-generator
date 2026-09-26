import * as service from '../services/GenerationService.js'
import { projectOf, roomOf } from './ProjectRoomSocket.js'

const handleEvents = (socket, io) => {
  socket.on('sendGenerationStarted',async () => {
    const projectId = projectOf(socket);
    if (!projectId) return;

    try {
      io.to(roomOf(projectId)).emit('GenerationStarted');
      console.log('GenerationStarted')
      await service.generate(projectId)
      console.log('GenerationFinished')
      io.to(roomOf(projectId)).emit('GenerationFinished');
    } catch (error) {
      console.error('Error starting generation:', error);
    }
  });

  socket.on('sendGenerationFinished', () => {
    const projectId = projectOf(socket);
    if (!projectId) return;

    try {
      io.to(roomOf(projectId)).emit('GenerationFinished');
    } catch (error) {
      console.error('Error finishing generation:', error);
    }
  });

  socket.on('sendGenerationCancelled', async () => {
    const projectId = projectOf(socket);
    if (!projectId) return;

    try {
      console.log('GenerationCancelled')
      service.cancel()
      io.to(roomOf(projectId)).emit('GenerationCancelled')
    } catch (error) {
      console.error('Error cancelling generation:', error);
    }
  })
};

export default handleEvents
