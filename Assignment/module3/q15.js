
const express = require('express');

const app = express();

// Request logging middleware
app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

// Students department
app.get('/students', (req, res) => {
    res.json([
        { id: 1, name: 'Anu', course: 'CSE' }
    ]);
});

// Courses department
app.get('/courses', (req, res) => {
    res.json([
        { id: 1, name: 'Web Development', credits: 4 }
    ]);
});

// 404 fallback
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
