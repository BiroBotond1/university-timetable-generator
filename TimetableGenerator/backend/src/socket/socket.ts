import { Server as SocketIOServer } from 'socket.io';

import handleLocationEvents from './LocationSocket.js';
import handleTeacherEvents from './TeacherSocket.js';
import handleConstraintEvents from './ConstraintSocket.js';
import handleSubjectEvents from './SubjectSocket.js';
import handleClassEvents from './ClassSocket.js';
import handleClassHourEvents from './ClassHourSocket.js';
import handleGenerationEvents from './GenerationSocket.js';
import handleImportExportEvents from './ImportExportSocket.js';
import handleAuth0Events from './Auth0Socket.js'
import handleProjectRoomEvents, { userRoomOf } from './ProjectRoomSocket.js'
import { setIo } from './notify.js'
import socketAuth from '../middleware/socketAuth.js'

const initializeSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origins: ['https://localhost:8081', 'https://localhost:8082']
    }
  });

  console.log('initialize socket')

  // Every connection must present a valid Auth0 token before any handler runs.
  io.use(socketAuth);

  setIo(io);

  io.on('connection', (socket) => {
    socket.join(userRoomOf(socket.data.userId));

    try {
      handleProjectRoomEvents(socket, io);
      handleConstraintEvents(socket, io);
      handleLocationEvents(socket, io);
      handleTeacherEvents(socket, io);
      handleSubjectEvents(socket, io);
      handleClassEvents(socket, io);
      handleClassHourEvents(socket, io);
      handleGenerationEvents(socket, io);
      handleImportExportEvents(socket, io);
      handleAuth0Events(socket, io)
    } catch (error) {
      console.error('Error handling socket events:', error);
    }
  });

  return io;
};

export default initializeSocket