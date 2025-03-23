const importExportService = require('../services/ImportExportService.js');

const handleImportExportEvents = (socket, io) => {
  socket.on('getTimetableData', async () => {
    const timetableData = await importExportService.getTimetableData()
    socket.emit('timetableData', timetableData);
  })

  socket.on('doImport', async (obj) => {
    await importExportService.doImport(obj.content)
    io.emit('importDone')
  })
}

module.exports = {
  handleImportExportEvents
};