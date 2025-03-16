const constraintService = require('../services/ConstraintService.js');

const handleConstraintEvents = (socket, io) => {
  socket.on('sendUpdateConstraint', (constraint) => {
    try {
      constraintService.updateConstraint(constraint._id, constraint);
      io.emit('updateConstraint', constraint);
    } catch (error) {
      console.error('Error updating constraint:', error);
    }
  });
};

module.exports = {
  handleConstraintEvents
};