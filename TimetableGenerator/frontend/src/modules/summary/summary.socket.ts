import { socket } from '@/modules/app/app.socket'
import type { GenerationData } from './summary.type';

export const setupSummarySocketListeners = (
  generationData: Ref<GenerationData>
) => {
  socket.on('generationData', async (obj) => {
    generationData.value = obj
  })
};

export const emitGetGenerationData = () => {
  socket.emit('getGenerationData');
};