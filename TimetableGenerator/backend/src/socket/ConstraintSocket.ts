import * as service from '../services/ConstraintService.js'

const handleEvents = async (socket, io) => {
  socket.on('sendUpdateConstraint', async (data) => {
    try {
      await service.update(data.constraint._id, data.constraint);
      io.emit('updateConstraint', data);
    } catch (error) {
      console.error('Error updating constraint:', error);
    }
  });
};

export default handleEvents