import * as teacherService from '../services/TeacherService.js'
import fs from 'fs'

const handleEvents = (socket, io) => {
  socket.on('getGenerationData', async () => {
    try {
      fs.readFile('../../Plot_data.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

       const generationData = {
        classFitnesses: [],
        teacherFitnesses: [],
        locationFitnesses: [],
        times: []
       } 

        data.split('\n').forEach(line => {
            const values = line.trim().split(/\s+/); // Split by whitespace
            if (values.length === 4) { // Ensure we have exactly 4 columns
              generationData.classFitnesses.push(Number(values[0]));
              generationData.teacherFitnesses.push(Number(values[1]));
              generationData.locationFitnesses.push(Number(values[2]));
              generationData.times.push(Number(values[3]));
            }
        });
        socket.emit('generationData', generationData);
    });
      
    } catch (error) {
      console.error('Error updating teacher:', error);
    }
  });
};

export default handleEvents