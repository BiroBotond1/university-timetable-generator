import express from 'express'
import http from 'http'
import mongoose from 'mongoose'
import bodyParser from 'body-parser';
import cors from 'cors';

import initializeSocket from './socket/socket.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import mongoMiddleware from './middleware/mongoMiddleware.js';
import {auth} from 'express-oauth2-jwt-bearer'

import timetableApiRouter from './routes/timetable.js';

import subjectApi from './api/SubjectApi.js';
import teacherApi from './api/TeacherApi.js';
import locationApi from './api/LocationApi.js';
import classApi from './api/ClassApi.js';
import classHourApi from './api/ClassHourApi.js';
import constraintApi from './api/ConstraintApi.js';
import userApi from './api/UserApi.js';
import * as constraintService from './services/ConstraintService.js';

import 'dotenv/config'

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
app.use(auth({
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  audience: process.env.AUDIENCE
}));

app.use(mongoMiddleware);

// api
app.use('/api/constraints', constraintApi);
app.use('/api/subjects', subjectApi);
app.use('/api/teachers', teacherApi);
app.use('/api/locations', locationApi);
app.use('/api/classes', classApi);
app.use('/api/classHours', classHourApi);

app.use('/api/users', userApi);

// Routes
app.use('/timetable', timetableApiRouter);

app.use(errorMiddleware); 

// Starting server
server.listen(3000, () => { console.log(`Server listening on http://localhost:${PORT}/ ...`); });

module.exports = app;
