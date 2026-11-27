
const mongoose = require('mongoose');

// Define Student Schema
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

    course: {
        type: String
    },

    marks: {
        type: Number,
        min: 0,
        max: 100
    }
});

// Create Student Model
const Student = mongoose.model("Student", studentSchema);

console.log("Student Schema and Model Created Successfully!");
