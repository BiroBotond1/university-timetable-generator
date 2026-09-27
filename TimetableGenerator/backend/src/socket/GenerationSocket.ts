import * as service from '../services/GenerationService.js'
import { projectOf, roomOf } from './ProjectRoomSocket.js'

const handleEvents = (socket, io) => {
  socket.on('sendGenerationStarted', async () => {
    const projectId = projectOf(socket);
    if (!projectId) return;

    try {
      // The client disables the button, but its state can be stale.
      if (service.isGenerating(projectId)) {
        return socket.emit('GenerationRefused', {
          message: 'A generation is already running for this project'
        });
      }

      io.to(roomOf(projectId)).emit('GenerationStarted');
      console.log('GenerationStarted')
      await service.generate(projectId)
      console.log('GenerationFinished')
      io.to(roomOf(projectId)).emit('GenerationFinished');
    } catch (error) {
      console.error('Error starting generation:', error);
      io.to(roomOf(projectId)).emit('GenerationFinished');
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
      service.cancel(projectId)
      io.to(roomOf(projectId)).emit('GenerationCancelled')
    } catch (error) {
      console.error('Error cancelling generation:', error);
    }
  })
};

export default handleEvents
