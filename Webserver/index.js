const express = require("express")
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { join } = require('path');
const errorMiddleware = require('./middleware/errorMiddleware.js');
const timetableApiRouter = require('./routes/timetable.js');
const cors = require('cors');
const subjectApi = require("./api/SubjectApi.js")
const teacherApi = require("./api/TeacherApi.js")
const locationApi = require("./api/LocationApi.js")
const classApi = require("./api/ClassApi.js")
const classHourApi = require("./api/ClassHourApi.js")

// Create express app
const app = express();

const PORT = 3000;

// Database
mongoose
    .connect('mongodb://localhost/timetabledb', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB database Connected...'))
    .catch((err) => console.log(err));

// Middleware
app.use(cors());    // allow cross origin requests
app.use(bodyParser.json()) // to convert the request into JSON

//api
app.use("/api/subject", subjectApi);
app.use("/api/teacher", teacherApi);
app.use("/api/location", locationApi);
app.use("/api/class", classApi);
app.use("/api/classHour", classHourApi);

// Routes
app.use('/timetable', timetableApiRouter);

app.use(errorMiddleware);

// Starting server
app.listen(3000, () => { console.log(`Server listening on http://localhost:${PORT}/ ...`); });

module.exports = app;