import * as service from '../services/ImportExportService.js'

const handleEvents = (socket, io) => {
  socket.on('getTimetableData', async () => {
    const timetableData = await service.getTimetableData()
    socket.emit('timetableData', timetableData);
  })

  socket.on('doImport', async (obj) => {
    await service.doImport(obj.content)
    io.emit('importDone')
  })
}

export default handleEvents