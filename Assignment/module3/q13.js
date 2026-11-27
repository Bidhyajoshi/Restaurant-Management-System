
const express = require('express');

const app = express();

// Import student router
const studentsRouter = require('./route/student');

// Mount student router
app.use('/students', studentsRouter);

// Start server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
