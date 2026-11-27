
import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/collegeDB')
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch(err => console.log(err));

// Student Schema
const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    course: String,
    marks: {
        type: Number,
        min: 0,
        max: 100
    }
});

// Create Model
const Student = mongoose.model('Student', studentSchema);

// POST API
app.post('/students', async (req, res) => {
    try {
        const student = new Student(req.body);
        const savedStudent = await student.save();

        res.status(201).json({
            message: 'Student Created Successfully!',
            student: savedStudent
        });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});

// Start Server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
