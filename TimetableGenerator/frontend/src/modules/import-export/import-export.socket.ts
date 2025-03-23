import { socket } from '@/modules/app/app.socket'
import { doExport } from './import-export.service'
import type { Router } from 'vue-router';

export const setupImportExportSocketListeners = (router: Router) => {
  socket.on('timetableData', async (data) => {
    await doExport(data)
  })

  socket.on('importDone', () => {
    if (router.currentRoute.value.path === '/') {
      window.location.reload(); // Full page reload
    } else {
      router.push('/'); // Navigate to /
    }
  })
}

export const emitGetTimetableData = () => {
  socket.emit('getTimetableData')
}

export const emitDoImport = (content :string) => {
  socket.emit('doImport', { content })
}