const constraintService = require('../services/ConstraintService.js');

const handleConstraintEvents = async (socket, io) => {
  socket.on('sendUpdateConstraint', async (data) => {
    try {
      await constraintService.updateConstraint(data.constraint._id, data.constraint);
      io.emit('updateConstraint', data);
    } catch (error) {
      console.error('Error updating constraint:', error);
    }
  });
};

module.exports = {
  handleConstraintEvents
};