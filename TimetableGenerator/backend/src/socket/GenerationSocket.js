const generationService = require('../services/GenerationService.js');

const handleGenerationEvents = (socket, io) => {
  socket.on('sendGenerationStarted',async () => {
    try {
      io.emit('GenerationStarted');
      console.log('GenerationStarted')
      await generationService.generate()
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
    try {
      console.log('GenerationCancelled')
      generationService.cancel()
      io.emit('GenerationCancelled')
    } catch (error) {
      console.error('Error cancelling generation:', error);
    }
  })
};

module.exports = {
  handleGenerationEvents
}