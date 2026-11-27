
const express = require('express');

const app = express();

// Correct route comes first
app.get('/students', (req, res) => {
    res.json([
        { id: 1, name: 'Anu' }
    ]);
});

// 404 middleware comes last
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
