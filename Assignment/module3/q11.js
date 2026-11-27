
const express = require('express');
const app = express();

// JSON middleware
app.use(express.json());

// In-memory student data
const students = [
    { id: 1, name: 'Anu', course: 'CSE' },
    { id: 2, name: 'Ravi', course: 'ECE' }
];

// GET all students
app.get('/students', (req, res) => {
    res.json(students);
});

// GET student by ID
app.get('/students/:id', (req, res) => {
    const id = Number(req.params.id);

    const student = students.find(s => s.id === id);

    if (!student) {
        return res.status(404).json({
            message: 'Student not found'
        });
    }

    res.json(student);
});

// POST new student
app.post('/students', (req, res) => {
    const student = {
        id: students.length + 1,
        name: req.body.name,
        course: req.body.course
    };

    students.push(student);

    res.status(201).json(student);
});

// 404 handling
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// Start server
app.listen(3000, () => {
    console.log('Student API running on port 3000');
});
