import * as service from '../services/GenerationService.js'
import { projectOf, roomOf } from './ProjectRoomSocket.js'

// Every change to a run's record goes to the whole project, so each open tab
// shows the same state and the same outcome.
const EVENT_FOR_STATUS = {
  queued: 'GenerationQueued',
  running: 'GenerationStarted',
  succeeded: 'GenerationFinished',
  failed: 'GenerationFinished',
  cancelled: 'GenerationCancelled',
};

const handleEvents = (socket, io) => {
  socket.on('sendGenerationStarted', async () => {
    const projectId = projectOf(socket);
    if (!projectId) return;

    const refuse = () => socket.emit('GenerationRefused', {
      message: 'A generation is already running for this project'
    });

    try {
      // The client disables the button, but its state can be stale.
      if (service.isGenerating(projectId)) return refuse();

      await service.generate(projectId, {
        startedBy: socket.data.userId,
        onUpdate: (run) => io.to(roomOf(projectId)).emit(EVENT_FOR_STATUS[run.status], run),
      });
    } catch (error) {
      // Only generate() refusing a second run gets here; a failed run is
      // recorded and reported through onUpdate.
      console.error('Error starting generation:', error);
      refuse();
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
      // The cancelled record reaches the room through onUpdate once the run
      // has stopped. With nothing to cancel, this tab's state was stale.
      if (!service.cancel(projectId, socket.data.userId)) {
        socket.emit('GenerationCancelled', null)
      }
    } catch (error) {
      console.error('Error cancelling generation:', error);
    }
  })
};

export default handleEvents
