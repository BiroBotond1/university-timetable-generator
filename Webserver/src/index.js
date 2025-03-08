const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const initializeSocket = require('./socket/socket.js');
const errorMiddleware = require('./middleware/errorMiddleware.js');
const authMiddleware = require('./middleware/authorizationMiddleware.js');
const mongoMiddleware = require('./middleware/mongoMiddleware.js');
const timetableApiRouter = require('./routes/timetable.js');
const cors = require('cors');
const subjectApi = require('./api/SubjectApi.js');
const teacherApi = require('./api/TeacherApi.js');
const locationApi = require('./api/LocationApi.js');
const classApi = require('./api/ClassApi.js');
const classHourApi = require('./api/ClassHourApi.js');
const constraintApi = require('./api/ConstraintApi.js');
const userApi = require('./api/UserApi.js');
const authorizationApi = require('./api/AutorizationApi.js')

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
  .then(() => console.log('MongoDB database Connected...'))
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
