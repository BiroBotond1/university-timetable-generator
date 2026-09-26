import * as service from '../services/GenerationService.js'
import { projectOf } from './ProjectRoomSocket.js'

const handleEvents = (socket, io) => {
  socket.on('sendGenerationStarted',async () => {
    const projectId = projectOf(socket);
    if (!projectId) return;

    try {
      io.emit('GenerationStarted');
      console.log('GenerationStarted')
      await service.generate(projectId)
      console.log('GenerationFinished')
      io.emit('GenerationFinished');
    } catch (error) {
      console.error('Error starting generation:', error);
    }
  });

  socket.on('sendGenerationFinished', () => {
    try {
      io.emit('GenerationFinished');
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
      io.emit('GenerationCancelled')
    } catch (error) {
      console.error('Error cancelling generation:', error);
    }
  })
};

export default handleEvents
