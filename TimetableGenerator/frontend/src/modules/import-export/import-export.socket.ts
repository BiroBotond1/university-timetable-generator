import { socket } from '@/modules/app/app.socket'
import { listen } from '@/modules/app/socket.listeners'
import { doExport } from './import-export.service'

export const setupImportExportSocketListeners = () => listen({
  timetableData: async (data) => {
    await doExport(data)
  },

  importDone: () => {
    window.location.reload();
  },
})

export const emitGetTimetableData = () => {
  socket.emit('getTimetableData')
}

export const emitDoImport = (content :string) => {
  socket.emit('doImport', { content })
}
