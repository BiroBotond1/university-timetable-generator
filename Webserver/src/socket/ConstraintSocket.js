const constraintService = require('../services/ConstraintService.js');

const handleConstraintEvents = (socket, io) => {
  socket.on('sendUpdateConstraints', (constraint) => {
    try {
      constraintService.updateConstraint(constraint._id, constraint);
      io.emit('updateConstraints', constraint);
    } catch (error) {
      console.error('Error updating constraints:', error);
    }
  });
};

module.exports = {
  handleConstraintEvents
};