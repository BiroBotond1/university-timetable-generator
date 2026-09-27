import * as service from '../services/ImportExportService.js'
import { projectOf, roomOf } from './ProjectRoomSocket.js'

const handleEvents = (socket, io) => {
  socket.on('getTimetableData', async () => {
    const projectId = projectOf(socket);
    if (!projectId) return;

    const timetableData = await service.getTimetableData(projectId)
    socket.emit('timetableData', timetableData);
  })

  socket.on('doImport', async (obj) => {
    const projectId = projectOf(socket);
    if (!projectId) return;

    await service.doImport(projectId, obj.content)
    io.to(roomOf(projectId)).emit('importDone')
  })
}

export default handleEvents
