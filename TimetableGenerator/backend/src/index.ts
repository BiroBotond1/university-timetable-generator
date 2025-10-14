import express from 'express'
import http from 'http'
import mongoose from 'mongoose'
import bodyParser from 'body-parser';
import cors from 'cors';

import initializeSocket from './socket/socket.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import authMiddleware from './middleware/authorizationMiddleware.js';
import mongoMiddleware from './middleware/mongoMiddleware.js';

import timetableApiRouter from './routes/timetable.js';

import subjectApi from './api/SubjectApi.js';
import teacherApi from './api/TeacherApi.js';
import locationApi from './api/LocationApi.js';
import classApi from './api/ClassApi.js';
import classHourApi from './api/ClassHourApi.js';
import constraintApi from './api/ConstraintApi.js';
import userApi from './api/UserApi.js';
import authorizationApi from './api/AutorizationApi.js';
import * as constraintService from './services/ConstraintService.js';


// Create express app
const app = express();
const server = http.createServer(app);
initializeSocket(server);

const PORT = 3000;

// Database
mongoose
  .connect('mongodb://localhost/timetabledb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('MongoDB database Connected...')
    constraintService.initializeConstraints() 
  })
  .catch((err) => console.log(err));

// Middleware
app.use(cors());            // allow cross origin requests
app.use(bodyParser.json()); // to convert the request into JSON

app.use(mongoMiddleware);

// api
app.use('/api/constraints', authMiddleware, constraintApi);
app.use('/api/subjects', authMiddleware, subjectApi);
app.use('/api/teachers', authMiddleware, teacherApi);
app.use('/api/locations', authMiddleware, locationApi);
app.use('/api/classes', authMiddleware, classApi);
app.use('/api/classHours', authMiddleware, classHourApi);

app.use('/api/users', authMiddleware, userApi);

app.use('/api', authorizationApi);
// Routes
app.use('/timetable', timetableApiRouter);

app.use(errorMiddleware); 

// Starting server
server.listen(3000, () => { console.log(`Server listening on http://localhost:${PORT}/ ...`); });

module.exports = app;
