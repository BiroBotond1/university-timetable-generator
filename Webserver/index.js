import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { join } from 'path';
import errorMiddleware from './middleware/errorMiddleware.js';
import timetableApiRouter from './routes/timetable.js';
import cors from 'cors';

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

// Routes
app.use('/timetable', timetableApiRouter);

app.use(errorMiddleware);

// Starting server
app.listen(3000, () => { console.log(`Server listening on http://localhost:${PORT}/ ...`); });