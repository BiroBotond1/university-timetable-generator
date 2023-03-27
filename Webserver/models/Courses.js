import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
    name: String,
    number: Number,
    invalidDays: [Number]
});

export default mongoose.model('Course', CourseSchema);