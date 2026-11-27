
const express = require('express');
const app = express();

app.use(express.json());

// Student data
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

// POST - Add student
app.post('/students', (req, res) => {
    const student = {
        id: students.length + 1,
        name: req.body.name,
        course: req.body.course
    };

    students.push(student);
    res.status(201).json(student);
});

// PUT - Update student
app.put('/students/:id', (req, res) => {
    const id = Number(req.params.id);
    const student = students.find(s => s.id === id);

    if (!student) {
        return res.status(404).json({
            message: 'Student not found'
        });
    }

    student.name = req.body.name;
    student.course = req.body.course;

    res.json(student);
});

// DELETE - Remove student
app.delete('/students/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: 'Student not found'
        });
    }

    students.splice(index, 1);

    res.json({
        message: 'Student deleted successfully'
    });
});

// Start server
app.listen(3000, () => {
    console.log('Student API running on port 3000');
});
