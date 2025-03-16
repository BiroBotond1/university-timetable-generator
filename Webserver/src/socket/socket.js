const socketIO = require('socket.io');
const { handleLocationEvents } = require('./LocationSocket');
const { handleTeacherEvents } = require('./TeacherSocket');
const { handleConstraintEvents } = require('./ConstraintSocket');
const { handleSubjectEvents } = require('./SubjectSocket');
const { handleClassEvents } = require('./ClassSocket');
const { handleClassHourEvents } = require('./ClassHourSocket');
const { handleGenerationEvents } = require('./GenerationSocket')

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origins: ['https://localhost:8081', 'https://localhost:8082']
    }
  });

  console.log('initialize socket')

  io.on('connection', (socket) => {

    try {
      handleConstraintEvents(socket, io);
      handleLocationEvents(socket, io);
      handleTeacherEvents(socket, io);
      handleSubjectEvents(socket, io);
      handleClassEvents(socket, io);
      handleClassHourEvents(socket, io);
      handleGenerationEvents(socket, io);
    } catch (error) {
      console.error('Error handling socket events:', error);
    }
  });

  return io;
};

module.exports = initializeSocket;