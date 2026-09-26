import express from 'express'
import http from 'http'
import mongoose from 'mongoose'
import bodyParser from 'body-parser';
import cors from 'cors';

import initializeSocket from './socket/socket.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import mongoMiddleware from './middleware/mongoMiddleware.js';
import userContext from './middleware/userContext.js';
import { requireProjectAccess } from './middleware/projectAccess.js';
import {auth} from 'express-oauth2-jwt-bearer'

import subjectApi from './api/SubjectApi.js';
import teacherApi from './api/TeacherApi.js';
import locationApi from './api/LocationApi.js';
import classApi from './api/ClassApi.js';
import classHourApi from './api/ClassHourApi.js';
import constraintApi from './api/ConstraintApi.js';
import projectApi from './api/ProjectApi.js';

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

// Bridges the validated JWT to the data layer; everything below reads
// req.context.user rather than touching req.auth.
app.use(userContext);

// api
app.use('/api/projects', projectApi);

// Project-scoped entities. requireProjectAccess resolves :projectId and
// verifies membership once, before any controller runs.
const scoped = '/api/projects/:projectId';
app.use(`${scoped}/constraints`, requireProjectAccess, constraintApi);
app.use(`${scoped}/subjects`, requireProjectAccess, subjectApi);
app.use(`${scoped}/teachers`, requireProjectAccess, teacherApi);
app.use(`${scoped}/locations`, requireProjectAccess, locationApi);
app.use(`${scoped}/classes`, requireProjectAccess, classApi);
app.use(`${scoped}/classHours`, requireProjectAccess, classHourApi);

app.use(errorMiddleware); 

// Starting server
server.listen(3000, () => { console.log(`Server listening on http://localhost:${PORT}/ ...`); });

module.exports = app;
